import axios from 'axios';

/**
 * Scrapes media URLs from a CompanyCam public timeline page
 * @param {string} publicUrl - The public timeline URL (e.g., https://app.companycam.com/timeline/...)
 * @returns {Promise<Array>} Array of media objects with URLs
 */
export async function scrapeTimelineMedia(publicUrl) {
  try {
    const response = await axios.get(publicUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;

    // Extract img.companycam.com URLs (these are photos/videos)
    const mediaUrlRegex = /https:\/\/img\.companycam\.com\/[^\s"'<>]+/g;
    const mediaUrls = html.match(mediaUrlRegex);

    if (!mediaUrls || mediaUrls.length === 0) {
      console.log('No media URLs found in timeline HTML');
      return [];
    }

    // Remove duplicates and filter out very small images (likely thumbnails/icons)
    const uniqueUrls = [...new Set(mediaUrls)];

    // Convert to media objects
    const media = uniqueUrls.map((url, index) => {
      // Determine if this is a video based on URL patterns
      // Videos often have .jpg thumbnail URLs but are actually videos
      const isVideo = url.includes('pending.s3') || url.includes('companycam-pending');

      return {
        id: `scraped-${index}`,
        media_type: isVideo ? 'video' : 'photo',
        uris: [
          {
            uri: url,
            size: 2048, // Assume high-res
            type: isVideo ? 'video' : 'image'
          }
        ],
        captured_at: new Date().toISOString(), // We don't have the real date from scraping
        source: 'scraped'
      };
    });

    console.log(`Scraped ${media.length} media items from timeline`);
    return media;

  } catch (error) {
    console.error('Error scraping timeline:', error.message);
    return [];
  }
}
