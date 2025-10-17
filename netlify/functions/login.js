import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email and password required' })
      };
    }

    // Find user
    const user = await prisma.businessUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Check if approved
    if (user.status !== 'approved') {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Account pending approval' })
      };
    }

    // Verify password
    if (!user.passwordHash) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Password not set. Please contact support.' })
      };
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        slug: user.slug,
        companyName: user.companyName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          slug: user.slug
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Login failed', details: error.message })
    };
  }
}
