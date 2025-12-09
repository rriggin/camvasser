import { handler as pageHandler } from './page.js';

// Wrapper function that sets tenant for Bud Roofing
export async function handler(event, context) {
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'budroofing';

  return pageHandler(event, context);
}
