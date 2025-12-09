import { loadTenantConfig } from './lib/tenant-config.js';

export async function handler(event) {
  const { tenant } = event.queryStringParameters || {};

  if (!tenant) {
    return {
      statusCode: 400,
      body: 'Missing tenant parameter'
    };
  }

  const config = loadTenantConfig();
  const tenantConfig = config.tenants[tenant];

  if (!tenantConfig) {
    return {
      statusCode: 404,
      body: 'Tenant not found'
    };
  }

  const html = generateHTML(tenantConfig);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300'
    },
    body: html
  };
}

function generateHTML(tenant) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tenant.name} - Services</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${tenant.colors.background};
      min-height: 100vh;
      color: #fff;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      height: 80px;
      margin-bottom: 20px;
    }

    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.7);
    }

    .flows {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .flow-card {
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 24px;
      text-decoration: none;
      color: #fff;
      transition: all 0.2s ease;
    }

    .flow-card:hover {
      background: rgba(255,255,255,0.15);
      border-color: ${tenant.colors.primary};
      transform: translateY(-2px);
    }

    .flow-card h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: ${tenant.colors.primary};
    }

    .flow-card p {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      line-height: 1.5;
    }

    .flow-card .arrow {
      display: inline-block;
      margin-left: 8px;
      transition: transform 0.2s ease;
    }

    .flow-card:hover .arrow {
      transform: translateX(4px);
    }

    .section-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 12px;
      margin-top: 32px;
    }

    .section-label:first-of-type {
      margin-top: 0;
    }

    .powered-by {
      text-align: center;
      padding: 40px 20px 20px;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .powered-by img {
      height: 16px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${tenant.logo}" alt="${tenant.name}" class="logo">
      <h1 class="title">How can we help?</h1>
      <p class="subtitle">Select an option below to get started</p>
    </div>

    <div class="flows">
      ${tenant.flows.includes('roof-claim-denial') ? `
      <div class="section-label">Qualification</div>
      <a href="/${tenant.slug}/roof-claim-denial" class="flow-card">
        <h3>Roof Claim Denied? <span class="arrow">&rarr;</span></h3>
        <p>See if you qualify for a second opinion review</p>
      </a>
      ` : ''}

      ${tenant.flows.includes('photos') ? `
      <div class="section-label">View Your Project</div>
      <a href="/${tenant.slug}/photos" class="flow-card">
        <h3>View Project Photos <span class="arrow">&rarr;</span></h3>
        <p>Enter your address to view photos from your roofing project</p>
      </a>
      ` : ''}
    </div>

    <div class="powered-by">
      <img src="/favicon.png" alt="Camvasser">
      <span>Powered by Camvasser</span>
    </div>
  </div>
</body>
</html>`;
}
