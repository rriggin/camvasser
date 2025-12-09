import { handler as pageHandler } from './page.js';

export async function handler(event, context) {
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'kcroofrestoration';

  return pageHandler(event, context);
}
