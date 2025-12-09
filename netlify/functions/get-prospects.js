import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

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
    const { limit, page, projectId, sortBy, sortDir, search } = event.queryStringParameters || {};
    const limitNum = limit ? parseInt(limit) : 25;
    const pageNum = page ? parseInt(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    // Filter by tenant (from authenticated user)
    if (user.slug) {
      where.tenant = user.slug;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Handle search with field:value syntax
    if (search) {
      const searchLower = search.toLowerCase().trim();

      // Check for field:value or field=value syntax
      const colonMatch = search.match(/^(\w+)[:=](.+)$/i);

      if (colonMatch) {
        const [, field, value] = colonMatch;
        const fieldLower = field.toLowerCase();
        const valueLower = value.toLowerCase().trim();

        if (fieldLower === 'status') {
          // status:yes/has = has any status, status:no/none = no status set
          if (['yes', 'true', 'has', 'set'].includes(valueLower)) {
            // Has status: not null AND not empty string
            where.AND = [
              { status: { not: null } },
              { status: { not: '' } }
            ];
          } else if (['no', 'false', 'none', 'null'].includes(valueLower)) {
            // No status: null OR empty string
            where.OR = [
              { status: null },
              { status: '' }
            ];
          } else {
            // Search for specific status value
            where.status = { contains: value.trim(), mode: 'insensitive' };
          }
        } else if (fieldLower === 'name') {
          where.name = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'homeowner' || fieldLower === 'owner') {
          where.isHomeowner = ['yes', 'true', '1'].includes(valueLower);
        } else if (fieldLower === 'email') {
          if (['yes', 'true', '1', 'has'].includes(valueLower)) {
            where.emails = { not: { equals: null } };
          } else if (['no', 'false', '0', 'none'].includes(valueLower)) {
            where.emails = { equals: null };
          }
        } else if (fieldLower === 'resident') {
          where.isCurrentResident = ['yes', 'true', '1'].includes(valueLower);
        }
      } else {
        // Simple text search across name and status
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { status: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    // Build sort order
    const validSortFields = ['name', 'createdAt', 'isHomeowner', 'companyName', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';
    // For status, put nulls at the end regardless of sort direction
    const orderBy = sortField === 'status'
      ? { [sortField]: { sort: sortDirection, nulls: 'last' } }
      : { [sortField]: sortDirection };

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy,
      take: limitNum,
      skip,
      include: {
        project: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            publicUrl: true
          }
        }
      }
    });

    const totalCount = await prisma.prospect.count({ where });
    const homeownerCount = await prisma.prospect.count({
      where: { ...where, isHomeowner: true }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: prospects.length,
        total: totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        homeowners: homeownerCount,
        prospects
      })
    };

  } catch (error) {
    console.error('Error fetching prospects:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch prospects',
        details: error.message
      })
    };
  }
}
