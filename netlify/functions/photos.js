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

    // Fetch all media (photos, videos, documents) for the project
    let allMedia = [];

    // Fetch photos
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

      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        // Tag each item with media type
        const photos = photosData.map(p => ({ ...p, media_type: 'photo' }));
        allMedia = allMedia.concat(photos);
        hasMore = photosData.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }

    // Fetch videos (if endpoint exists)
    try {
      const videosResponse = await fetch(
        `https://api.companycam.com/v2/projects/${projectId}/videos`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        // Tag each item with media type and add to media array
        const videos = videosData.map(v => ({ ...v, media_type: 'video' }));
        allMedia = allMedia.concat(videos);
        console.log(`Found ${videos.length} videos for project ${projectId}`);
      }
    } catch (error) {
      console.log(`No videos endpoint or error fetching videos: ${error.message}`);
    }

    // Fetch documents (if endpoint exists)
    try {
      const docsResponse = await fetch(
        `https://api.companycam.com/v2/projects/${projectId}/documents`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        // Tag each item with media type and add to media array
        const docs = docsData.map(d => ({ ...d, media_type: 'document' }));
        allMedia = allMedia.concat(docs);
        console.log(`Found ${docs.length} documents for project ${projectId}`);
      }
    } catch (error) {
      console.log(`No documents endpoint or error fetching documents: ${error.message}`);
    }

    // Sort all media by date (newest first)
    allMedia.sort((a, b) => {
      const dateA = new Date(a.captured_at || a.created_at || 0);
      const dateB = new Date(b.captured_at || b.created_at || 0);
      return dateB - dateA;
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        project,
        photos: allMedia, // Return all media types (photos, videos, documents)
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
