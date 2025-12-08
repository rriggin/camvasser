import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Valid status values
const VALID_STATUSES = [
  'left_voicemail',
  'hung_up',
  'wrong_number',
  'callback',
  'appointment_set',
  'bad_number',
  'follow_up_email_sent',
  'roof_replaced',
  'not_interested',
  'no_need',
  'no_answer',
  'wants_quote_phone',
  'follow_up_sms_sent'
];

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
  // Only allow POST/PATCH
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
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
    const { prospectId, status } = JSON.parse(event.body);

    if (!prospectId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'prospectId is required' })
      };
    }

    // Allow null/empty to clear status, otherwise validate
    if (status && !VALID_STATUSES.includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid status value',
          validStatuses: VALID_STATUSES
        })
      };
    }

    // Verify the prospect belongs to this tenant
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      select: { tenant: true }
    });

    if (!prospect) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prospect not found' })
      };
    }

    if (prospect.tenant !== user.slug) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Access denied' })
      };
    }

    // Update the status
    const updated = await prisma.prospect.update({
      where: { id: prospectId },
      data: { status: status || null }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        prospect: {
          id: updated.id,
          status: updated.status
        }
      })
    };

  } catch (error) {
    console.error('Error updating prospect status:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to update prospect status',
        details: error.message
      })
    };
  }
}
