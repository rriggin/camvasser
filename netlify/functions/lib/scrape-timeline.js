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
    const media = [];

    // 1. Extract Mux video URLs (actual video files)
    const muxRegex = /https:\/\/stream\.mux\.com\/[^\s"'<>]+/g;
    const muxUrls = html.match(muxRegex);

    if (muxUrls) {
      const uniqueMuxUrls = [...new Set(muxUrls)];
      console.log(`Found ${uniqueMuxUrls.length} Mux video URLs`);

      uniqueMuxUrls.forEach((url, index) => {
        media.push({
          id: `video-${index}`,
          media_type: 'video',
          uris: [
            {
              uri: url,
              type: 'video/mp4'
            }
          ],
          captured_at: new Date().toISOString(),
          source: 'scraped'
        });
      });
    }

    // 2. Extract img.companycam.com URLs (photos)
    const imgRegex = /https:\/\/img\.companycam\.com\/[^\s"'<>]+/g;
    const imgUrls = html.match(imgRegex);

    if (imgUrls) {
      const uniqueImgUrls = [...new Set(imgUrls)];
      console.log(`Found ${uniqueImgUrls.length} image URLs`);

      uniqueImgUrls.forEach((url, index) => {
        // Skip images that look like video thumbnails if we already have the video
        const isProbablyVideoThumbnail = url.includes('pending.s3') || url.includes('companycam-pending');

        if (!isProbablyVideoThumbnail || muxUrls.length === 0) {
          media.push({
            id: `photo-${index}`,
            media_type: 'photo',
            uris: [
              {
                uri: url,
                size: 2048,
                type: 'image'
              }
            ],
            captured_at: new Date().toISOString(),
            source: 'scraped'
          });
        }
      });
    }

    if (media.length === 0) {
      console.log('No media URLs found in timeline HTML');
      return [];
    }

    console.log(`Scraped ${media.length} media items from timeline (${muxUrls?.length || 0} videos, ${media.length - (muxUrls?.length || 0)} photos)`);
    return media;

  } catch (error) {
    console.error('Error scraping timeline:', error.message);
    return [];
  }
}
