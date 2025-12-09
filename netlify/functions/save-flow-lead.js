import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Required fields
    const { tenant, flowType, flowSlug, name, email, phone } = data;

    if (!tenant || !flowType || !flowSlug || !name || !email || !phone) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['tenant', 'flowType', 'flowSlug', 'name', 'email', 'phone']
        })
      };
    }

    // Split name into first/last (Lead table expects separate fields)
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address: data.address || null,
        tenant,
        source: 'flow',
        flowType,
        flowSlug,
        flowData: data.flowData || null,
        urgencyLevel: data.urgencyLevel || null,
        qualifyScore: data.qualifyScore || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        id: lead.id,
        qualifyScore: lead.qualifyScore,
        urgencyLevel: lead.urgencyLevel
      })
    };

  } catch (error) {
    console.error('Error saving flow lead:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to save lead' })
    };
  }
}
