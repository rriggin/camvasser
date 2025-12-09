import { handler as flowHandler } from './flow-roof-claim-denial.js';

// Wrapper function that sets tenant for Bud Roofing
export async function handler(event, context) {
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'budroofing';

  return flowHandler(event, context);
}
