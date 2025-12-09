import { handler as indexHandler } from './tenant-index.js';

// Wrapper function that shows the tenant index page
export async function handler(event, context) {
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'kcroofrestoration';

  return indexHandler(event, context);
}
