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
    const { type, limit, page, sortBy, sortDir, search } = event.queryStringParameters || {};
    // Always filter by the authenticated user's slug
    const tenant = user.slug;

    const limitNum = limit ? parseInt(limit) : 25;
    const pageNum = page ? parseInt(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    // Build sort order - default to createdAt desc
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'email', 'phone', 'address'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortDirection };

    if (type === 'business') {
      // Fetch business user signups
      const [businessUsers, total] = await Promise.all([
        prisma.businessUser.findMany({
          orderBy,
          take: limitNum,
          skip
        }),
        prisma.businessUser.count()
      ]);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business',
          count: businessUsers.length,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          leads: businessUsers
        })
      };
    }

    // Fetch users
    const where = tenant ? { tenant } : {};

    // Handle search with field:value syntax
    if (search) {
      const colonMatch = search.match(/^(\w+)[:=](.+)$/i);

      if (colonMatch) {
        const [, field, value] = colonMatch;
        const fieldLower = field.toLowerCase();
        const valueLower = value.toLowerCase().trim();

        if (fieldLower === 'name' || fieldLower === 'firstname') {
          where.firstName = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'lastname') {
          where.lastName = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'email') {
          where.email = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'phone') {
          where.phone = { contains: value.trim(), mode: 'insensitive' };
        } else if (fieldLower === 'address') {
          where.address = { contains: value.trim(), mode: 'insensitive' };
        }
      } else {
        // Simple text search across name, email, phone, address
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        take: limitNum,
        skip
      }),
      prisma.lead.count({ where })
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lead',
        tenant: tenant || 'all',
        count: leads.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        leads
      })
    };

  } catch (error) {
    console.error('Error fetching leads:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch leads',
        details: error.message
      })
    };
  }
}
