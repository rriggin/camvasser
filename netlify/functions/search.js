import axios from 'axios';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Load tenant configuration
function loadTenantConfig() {
  // Use process.cwd() which works in Netlify Functions
  const configPath = join(process.cwd(), 'tenants.yml');
  const configFile = readFileSync(configPath, 'utf8');
  return yaml.load(configFile);
}

export async function handler(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { address, tenant } = event.queryStringParameters || {};

  if (!address) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Address parameter required' })
    };
  }

  if (!tenant) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Tenant parameter required' })
    };
  }

  try {
    // Load tenant configuration
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[tenant];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Tenant not found',
          tenant: tenant,
          available: Object.keys(config.tenants)
        })
      };
    }

    // Get Company Cam API token from environment variable specified in tenant config
    const apiTokenEnvVar = tenantConfig.companycam_api_token_env;
    const apiToken = process.env[apiTokenEnvVar];

    if (!apiToken) {
      throw new Error(`Missing Company Cam API token for environment variable: ${apiTokenEnvVar}`);
    }

    // Fetch projects page by page and search as we go
    let bestMatch = null;
    let page = 1;
    let hasMore = true;
    const perPage = 50; // CompanyCam API default
    const searchLower = address.toLowerCase().trim();
    const searchNumbers = searchLower.match(/\d+/g)?.join('') || '';

    // Fetch pages until we find a match or run out of pages
    // No hard limit - search the entire account
    const requestTimeout = 5000; // 5 seconds per request
    const startTime = Date.now();
    const maxSearchTime = 30000; // 30 seconds total search time limit

    while (hasMore && !bestMatch) {
      // Safety check: don't search for more than 30 seconds total
      if (Date.now() - startTime > maxSearchTime) {
        console.log(`Search timed out after ${page - 1} pages`);
        break;
      }
      const response = await axios.get('https://api.companycam.com/v2/projects', {
        params: {
          per_page: perPage,
          page: page
        },
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json'
        },
        timeout: requestTimeout
      });

      const projects = response.data || [];

      if (projects.length === 0) {
        // No more results
        break;
      }

      console.log(`Page ${page}: fetched ${projects.length} projects`);

      // Debug: Log first 3 addresses from page 1
      if (page === 1) {
        console.log('Sample addresses from first page:');
        projects.slice(0, 5).forEach((p, i) => {
          if (p.address?.street_address_1) {
            console.log(`  ${i + 1}. ${p.address.street_address_1} (${p.photo_count} photos)`);
          }
        });
      }

      // Search this page for a match
      bestMatch = projects.find(p => {
        // Skip projects with no address
        if (!p.address || !p.address.street_address_1) {
          return false;
        }

        // Skip projects with no photos
        if (!p.photo_count || p.photo_count === 0) {
          return false;
        }

        const addr = p.address.street_address_1.toLowerCase().trim();
        const addrNumbers = addr.match(/\d+/g)?.join('') || '';

        // Check if street numbers match
        if (searchNumbers && addrNumbers && searchNumbers === addrNumbers) {
          console.log(`Number match: ${p.address.street_address_1} (${addrNumbers} === ${searchNumbers})`);
          return true;
        }

        // Check if full address matches
        if (addr.includes(searchLower) || searchLower.includes(addr)) {
          console.log(`Text match: ${p.address.street_address_1}`);
          return true;
        }

        return false;
      });

      // If we found a match, stop searching
      if (bestMatch) {
        console.log(`Found match on page ${page}: ${bestMatch.address.street_address_1}`);
        break;
      }

      // If we got fewer than perPage results, we've reached the end
      hasMore = projects.length === perPage;
      page++;
    }

    // If no match found after all pages
    if (!bestMatch) {
      console.log(`No match found for: ${address} after searching ${page - 1} pages`);
    }

    if (bestMatch) {
      // Fetch photos for the project (up to 5)
      let photos = [];
      try {
        const photosResponse = await axios.get(`https://api.companycam.com/v2/projects/${bestMatch.id}/photos`, {
          params: {
            per_page: 5
          },
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json'
          },
          timeout: 5000
        });

        photos = (photosResponse.data || []).map(photo => ({
          thumbnail: photo.uris?.find(u => u.type === 'thumbnail')?.uri ||
                     photo.uris?.find(u => u.type === 'web')?.uri ||
                     photo.uris?.[0]?.uri
        })).filter(p => p.thumbnail);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          found: true,
          project: {
            address: bestMatch.address?.street_address_1,
            city: bestMatch.address?.city,
            state: bestMatch.address?.state,
            url: bestMatch.public_url,
            photo_count: bestMatch.photo_count,
            photos: photos
          }
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          found: false,
          message: 'No project found for this address'
        })
      };
    }
  } catch (error) {
    console.error('Company Cam search error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Search failed',
        details: error.message
      })
    };
  }
}
