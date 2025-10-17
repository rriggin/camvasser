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
    const { type, limit } = event.queryStringParameters || {};
    // Always filter by the authenticated user's slug
    const tenant = user.slug;

    const limitNum = limit ? parseInt(limit) : 100;

    if (type === 'business') {
      // Fetch business user signups
      const businessUsers = await prisma.businessUser.findMany({
        orderBy: { createdAt: 'desc' },
        take: limitNum
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business',
          count: businessUsers.length,
          leads: businessUsers
        })
      };
    }

    // Fetch users
    const where = tenant ? { tenant } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user',
        tenant: tenant || 'all',
        count: users.length,
        leads: users
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
