import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify JWT token
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function handler(event) {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = verifyToken(authHeader);

  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized - Please log in' })
    };
  }

  try {
    const { limit, page, search, status, sortBy, sortDir, tag, hasProspects } = event.queryStringParameters || {};
    const limitNum = limit ? parseInt(limit) : 25;
    const pageNum = page ? parseInt(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    // Filter by hasProspects
    if (hasProspects === 'true') {
      where.prospects = { some: {} };
    } else if (hasProspects === 'false') {
      where.prospects = { none: {} };
    }

    // Handle search with field:value syntax
    if (search) {
      const colonMatch = search.match(/^(\w+)[:=](.+)$/i);

      if (colonMatch) {
        const [, field, value] = colonMatch;
        const fieldLower = field.toLowerCase();
        const valueLower = value.toLowerCase().trim();

        if (fieldLower === 'address') {
          where.address = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'city') {
          where.city = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'state') {
          where.state = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'tag') {
          // Tag search is handled separately via the tag parameter
          // But support it here too for convenience
          const tagPattern = `%"value": "${value.trim()}"%`;
          const projectIds = await prisma.$queryRaw`
            SELECT id FROM "Project"
            WHERE tags::text ILIKE ${tagPattern}
          `;
          const ids = projectIds.map(p => p.id);
          if (ids.length === 0) {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                count: 0,
                total: 0,
                page: pageNum,
                totalPages: 0,
                projects: []
              })
            };
          }
          where.id = { in: ids };
        } else if (fieldLower === 'contacts' || fieldLower === 'prospects') {
          // contacts:yes = has contacts, contacts:no = no contacts
          if (['yes', 'true', 'has', '1'].includes(valueLower)) {
            where.prospects = { some: {} };
          } else if (['no', 'false', 'none', '0'].includes(valueLower)) {
            where.prospects = { none: {} };
          }
        }
      } else {
        // Simple text search across address, city, state
        where.OR = [
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    // Filter by tag if provided - use raw SQL for PostgreSQL JSON search
    // Prisma's string_contains doesn't work reliably with JSON fields on PostgreSQL
    if (tag) {
      const tagPattern = `%"value": "${tag}"%`;
      const projectIds = await prisma.$queryRaw`
        SELECT id FROM "Project"
        WHERE tags::text ILIKE ${tagPattern}
      `;
      const ids = projectIds.map(p => p.id);
      if (ids.length === 0) {
        // No projects match this tag, return empty result
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            count: 0,
            total: 0,
            page: pageNum,
            totalPages: 0,
            projects: []
          })
        };
      }
      where.id = { in: ids };
    }

    // Build sort order
    const validSortFields = ['address', 'city', 'state', 'photoCount', 'lastSyncedAt', 'ccCreatedAt'];
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';

    // Handle prospect count sorting specially (relation count)
    let orderBy;
    if (sortBy === 'prospectCount') {
      orderBy = {
        prospects: {
          _count: sortDirection
        }
      };
    } else {
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastSyncedAt';
      orderBy = { [sortField]: sortDirection };
    }

    // Fetch projects with prospect counts and prospect details
    const projects = await prisma.project.findMany({
      where,
      orderBy,
      take: limitNum,
      skip,
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        status: true,
        photoCount: true,
        publicUrl: true,
        featureImage: true,
        tags: true,
        ccCreatedAt: true,
        ccUpdatedAt: true,
        lastSyncedAt: true,
        prospects: {
          select: {
            id: true,
            name: true,
            isHomeowner: true,
            isDead: true
          },
          orderBy: { isHomeowner: 'desc' }
        },
        _count: {
          select: { prospects: true }
        }
      }
    });

    // Flatten the _count field
    const projectsWithCounts = projects.map(p => ({
      ...p,
      prospectCount: p._count.prospects,
      _count: undefined
    }));

    // Get total count
    const totalCount = await prisma.project.count({ where });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: projectsWithCounts.length,
        total: totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        projects: projectsWithCounts
      })
    };

  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch projects',
        details: error.message
      })
    };
  }
}
