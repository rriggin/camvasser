import { handler as pageHandler } from './page.js';

// Wrapper function that automatically passes tenant=budroofing
export async function handler(event, context) {
  // Add tenant to query string parameters
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'budroofing';

  // Call the main page handler
  return pageHandler(event, context);
}
