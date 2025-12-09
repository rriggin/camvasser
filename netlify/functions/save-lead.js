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

    const { firstName, lastName, email, phone, address, projectId, tenant } = data;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !tenant) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['firstName', 'lastName', 'email', 'phone', 'tenant']
        })
      };
    }

    // Save to database
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address: address || '',
        projectId: projectId || null,
        tenant
      }
    });

    console.log('Lead saved:', lead.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        leadId: lead.id
      })
    };

  } catch (error) {
    console.error('Error saving lead:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to save lead',
        details: error.message
      })
    };
  }
}
