import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    const { name, email, phone, companyName, domain, slug } = data;

    // Validate required fields
    if (!name || !email || !phone || !companyName) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['name', 'email', 'phone', 'companyName']
        })
      };
    }

    // Check if email already exists
    const existingUser = await prisma.businessUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Email already registered',
          message: 'A business user with this email already exists'
        })
      };
    }

    // Save to database
    const businessUser = await prisma.businessUser.create({
      data: {
        name,
        email,
        phone,
        companyName,
        domain: domain || null,
        slug: slug || null
      }
    });

    console.log('Business user saved:', businessUser.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        userId: businessUser.id
      })
    };

  } catch (error) {
    console.error('Error saving business user:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Duplicate entry',
          message: 'Email or slug already exists'
        })
      };
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to save business user',
        details: error.message
      })
    };
  }
}
