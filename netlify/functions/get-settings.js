import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import jwt from 'jsonwebtoken';

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

// Load tenant configuration
function loadTenantConfig() {
  const configPath = join(process.cwd(), 'tenants.yml');
  const configFile = readFileSync(configPath, 'utf8');
  return yaml.load(configFile);
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
    // Load tenant config
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[user.slug];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Tenant configuration not found' })
      };
    }

    // Get API key from environment
    const apiKeyEnvVar = tenantConfig.companycam_api_token_env;
    const apiKey = process.env[apiKeyEnvVar];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: tenantConfig.domain,
        logo: tenantConfig.logo,
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not set',
        slug: user.slug
      })
    };

  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to load settings',
        details: error.message
      })
    };
  }
}
