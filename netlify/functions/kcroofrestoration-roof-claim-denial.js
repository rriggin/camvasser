import { handler as flowHandler } from './flow-roof-claim-denial.js';

// Wrapper function that sets tenant for KC Roof Restoration
export async function handler(event, context) {
  event.queryStringParameters = event.queryStringParameters || {};
  event.queryStringParameters.tenant = 'kcroofrestoration';

  return flowHandler(event, context);
}
