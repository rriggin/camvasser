import { loadTenantConfig } from './lib/tenant-config.js';

export async function handler(event) {
  const { tenant, projectId } = event.queryStringParameters || {};

  if (!tenant || !projectId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing tenant or projectId parameter' })
    };
  }

  try {
    // Load tenant configuration
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[tenant];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Tenant not found' })
      };
    }

    // Get API token from environment variable
    const apiToken = process.env[tenantConfig.companycam_api_token_env];
    if (!apiToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API token not configured' })
      };
    }

    // Fetch project details
    const projectResponse = await fetch(`https://api.companycam.com/v2/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json'
      }
    });

    if (!projectResponse.ok) {
      return {
        statusCode: projectResponse.status,
        body: JSON.stringify({ error: 'Failed to fetch project' })
      };
    }

    const project = await projectResponse.json();

    // Fetch all photos for the project
    let allPhotos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const photosResponse = await fetch(
        `https://api.companycam.com/v2/projects/${projectId}/photos?per_page=100&page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!photosResponse.ok) break;

      const photosData = await photosResponse.json();
      allPhotos = allPhotos.concat(photosData);

      // Check if there are more pages
      hasMore = photosData.length === 100;
      page++;
    }

    // Sort photos by date (newest first)
    allPhotos.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        project,
        photos: allPhotos,
        tenant: tenantConfig
      })
    };

  } catch (error) {
    console.error('Error fetching photos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
