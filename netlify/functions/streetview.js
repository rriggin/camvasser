// Server-side proxy for Google Maps APIs
// This avoids CORS issues with calling Google APIs directly from the browser

export async function handler(event) {
  const { address, type } = event.queryStringParameters || {};

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Handle static map request (for KC metro preview) - returns actual image bytes
  if (type === 'staticmap') {
    if (!apiKey) {
      return {
        statusCode: 404,
        body: 'API key not configured'
      };
    }

    try {
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=Kansas+City,MO&zoom=10&size=560x200&maptype=roadmap&style=feature:all|element:labels|visibility:simplified&style=feature:road|element:geometry|color:0x6b7280&style=feature:water|color:0x1e3a5f&style=feature:landscape|color:0x1f2937&key=${apiKey}`;

      const response = await fetch(mapUrl);

      if (!response.ok) {
        return {
          statusCode: response.status,
          body: 'Failed to fetch map image'
        };
      }

      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400'
        },
        body: base64Image,
        isBase64Encoded: true
      };
    } catch (error) {
      console.error('Static map fetch error:', error);
      return {
        statusCode: 500,
        body: 'Error fetching map image'
      };
    }
  }

  if (!address) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing address parameter' })
    };
  }

  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, reason: 'API key not configured' })
    };
  }

  try {
    // Step 1: Geocode the address to get lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: false, reason: 'Could not geocode address' })
      };
    }

    const location = geocodeData.results[0].geometry.location;

    // Step 2: Check if Street View is available at this location
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${location.lat},${location.lng}&key=${apiKey}`;
    const metadataResponse = await fetch(metadataUrl);
    const metadataData = await metadataResponse.json();

    if (metadataData.status !== 'OK') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: false, reason: 'Street View not available at this location' })
      };
    }

    // Step 3: Build the Street View image URL (with pitch to see the roof)
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${location.lat},${location.lng}&pitch=20&key=${apiKey}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      },
      body: JSON.stringify({
        available: true,
        imageUrl: streetViewUrl,
        lat: location.lat,
        lng: location.lng
      })
    };

  } catch (error) {
    console.error('Street View API error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, reason: 'API error' })
    };
  }
}
