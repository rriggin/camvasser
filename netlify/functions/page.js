import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Load tenant configuration
function loadTenantConfig() {
  // Use process.cwd() which works in Netlify Functions
  const configPath = join(process.cwd(), 'tenants.yml');
  const configFile = readFileSync(configPath, 'utf8');
  return yaml.load(configFile);
}

// Generate dynamic HTML for a tenant
function generateHTML(tenant) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tenant.page_title}</title>

  <!-- Open Graph / Social Media Preview -->
  <meta property="og:title" content="${tenant.page_title}">
  <meta property="og:description" content="${tenant.page_subtitle}">
  <meta property="og:image" content="${tenant.og_image}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${tenant.page_title}">
  <meta name="twitter:description" content="${tenant.page_subtitle}">
  <meta name="twitter:image" content="${tenant.og_image}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Outfit', -apple-system, system-ui, sans-serif;
      background: ${tenant.colors.background};
      color: #212529;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: #FFFFFF;
      max-width: 600px;
      width: 100%;
      padding: 0;
      text-align: center;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .logo-container {
      padding: 30px 40px 20px;
      background: linear-gradient(135deg, ${tenant.colors.logoBackground} 0%, ${tenant.colors.background} 100%);
    }

    .logo-placeholder img {
      max-width: 133px;
      height: auto;
      margin: 0 auto;
      display: block;
    }

    .content {
      padding: 20px 40px 40px;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #212529;
      margin-bottom: 12px;
    }

    .subtitle {
      color: #6C757D;
      font-size: 18px;
      margin-bottom: 25px;
      line-height: 1.5;
    }

    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }

    label {
      display: block;
      color: #212529;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    input[type="text"] {
      width: 100%;
      padding: 16px;
      background: #FFFFFF;
      border: 2px solid #E5E5E5;
      border-radius: 0;
      color: #212529;
      font-size: 16px;
      font-family: 'Outfit', sans-serif;
      transition: all 0.2s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: ${tenant.colors.primary};
      background: #FFFFFF;
      box-shadow: 0 0 0 4px ${tenant.colors.primary}1A;
    }

    input[type="text"]::placeholder {
      color: #ADB5BD;
    }

    .btn {
      width: 100%;
      padding: 18px;
      border: none;
      border-radius: 0;
      font-size: 18px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 10px;
    }

    .btn-primary {
      background: ${tenant.colors.primary};
      color: #212529;
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      background: ${tenant.colors.primaryHover};
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${tenant.colors.primary}66;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-success {
      background: ${tenant.colors.primary};
      color: #212529;
      border: none;
      font-size: 18px;
      margin-bottom: 20px;
    }

    .btn-success:hover {
      background: ${tenant.colors.primaryHover};
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${tenant.colors.primary}66;
    }

    .btn-call {
      background: #28A745;
      color: white;
      border: none;
      text-decoration: none;
      display: block;
      font-size: 18px;
    }

    .btn-call:hover {
      background: #218838;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }

    .result {
      display: none;
      margin-top: 30px;
      padding: 30px;
      border-radius: 0;
      background: #F8F9FA;
      border: 2px solid #E5E5E5;
    }

    .result.success {
      border-color: ${tenant.colors.primary};
      background: ${tenant.colors.primary}1A;
    }

    .result.error {
      border-color: #DC3545;
      background: #FFE5E8;
    }

    .result.not-found {
      border-color: #FF9800;
      background: #FFF3E0;
    }

    .result-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E5E5E5;
      color: #212529;
    }

    .result-message {
      color: #6C757D;
      margin-bottom: 30px;
      line-height: 1.8;
      font-size: 17px;
    }

    .result-message strong {
      color: #212529;
      display: block;
      margin-bottom: 8px;
      font-size: 19px;
      line-height: 1.4;
    }

    .loader {
      display: none;
      margin: 25px auto;
      border: 4px solid #F8F9FA;
      border-top: 4px solid ${tenant.colors.primary};
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .photo-count {
      color: #6C757D;
      margin-top: 20px;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 600;
    }

    .photo-thumbnails {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin: 20px 0;
    }

    .photo-thumbnails img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      border: 2px solid #E5E5E5;
    }

    .reset-link {
      display: inline-block;
      margin-top: 20px;
      color: #6C757D;
      text-decoration: none;
      font-size: 16px;
      cursor: pointer;
      transition: color 0.2s;
    }

    .reset-link:hover {
      color: #212529;
      text-decoration: underline;
    }

    #resultAction {
      margin-top: 20px;
    }

    #resultAction .btn {
      margin-top: 0;
      margin-bottom: 15px;
    }

    #resultAction .btn:first-child {
      margin-top: 35px;
    }

    #resultAction .btn:last-child {
      margin-bottom: 0;
    }

    .powered-by {
      margin-top: 40px;
      margin-bottom: -40px;
      padding-top: 25px;
      border-top: 1px solid #E5E5E5;
      color: #ADB5BD;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
    }

    .powered-by img {
      width: 120px;
      height: auto;
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo-placeholder">
        <img src="${tenant.logo}" alt="${tenant.name}">
      </div>
    </div>

    <div class="content">
      <h1>${tenant.heading}</h1>
      <p class="subtitle">${tenant.subheading}</p>

      <div id="searchForm">
        <div class="input-group">
          <label for="address">Street Address</label>
          <input
            type="text"
            id="address"
            placeholder="e.g., 123 Main Street"
            autofocus
          >
          <div style="margin-top: 8px; font-size: 14px; color: #6C757D;">Press Enter to search</div>
        </div>
      </div>

      <div class="loader" id="loader"></div>

      <div id="result" class="result">
        <div class="result-title" id="resultTitle"></div>
        <div class="result-message" id="resultMessage"></div>
        <div id="resultAction"></div>
      </div>

      <div class="powered-by">
        <span>Powered by CamTagger</span>
        <img src="/company-cam-logo.png" alt="CompanyCam">
      </div>
    </div>
  </div>

  <script>
    const PHONE_NUMBER = '${tenant.phone}';
    const TENANT_SLUG = '${tenant.slug}';

    async function searchAddress() {
      const addressInput = document.getElementById('address');
      const address = addressInput.value.trim();

      if (!address) {
        alert('Please enter an address');
        return;
      }

      // Show loader, hide search form and previous results
      document.getElementById('loader').style.display = 'block';
      document.getElementById('result').style.display = 'none';
      document.getElementById('searchForm').style.display = 'none';

      try {
        const response = await fetch(\`/.netlify/functions/search?address=\${encodeURIComponent(address)}&tenant=\${TENANT_SLUG}\`);
        const data = await response.json();

        console.log('Search response:', data); // Debug log

        // Hide loader
        document.getElementById('loader').style.display = 'none';

        if (data.found && data.project) {
          showSuccess(data.project);
        } else {
          showNotFound();
        }
      } catch (error) {
        console.error('Search error:', error);
        document.getElementById('loader').style.display = 'none';
        showError();
      }
    }

    function showSuccess(project) {
      const result = document.getElementById('result');
      result.className = 'result success';
      result.style.display = 'block';

      document.getElementById('resultTitle').textContent = '✓ Project Found!';

      // Build photo thumbnails HTML
      let thumbnailsHTML = '';
      if (project.photos && project.photos.length > 0) {
        thumbnailsHTML = '<div class="photo-thumbnails">';
        project.photos.forEach(photo => {
          thumbnailsHTML += \`<img src="\${photo.thumbnail}" alt="Project photo">\`;
        });
        thumbnailsHTML += '</div>';
      }

      document.getElementById('resultMessage').innerHTML = \`
        <div style="font-size: 19px; font-weight: 700; color: #212529; margin-bottom: 15px; line-height: 1.4;">\${project.address}</div>
        <div style="font-size: 17px; color: #6C757D; margin-bottom: 30px;">\${project.city}, \${project.state}</div>
        \${thumbnailsHTML}
        <div class="photo-count">\${project.photo_count} Photos</div>
      \`;
      document.getElementById('resultAction').innerHTML = \`
        <a href="\${project.url}" target="_blank" class="btn btn-success">
          View Project Photos
        </a>
        <div><a href="#" class="reset-link" onclick="event.preventDefault(); resetForm();">← Search Another Address</a></div>
      \`;
    }

    function showNotFound() {
      const result = document.getElementById('result');
      result.className = 'result not-found';
      result.style.display = 'block';

      document.getElementById('resultTitle').textContent = 'Project Not Found';
      document.getElementById('resultMessage').textContent =
        "We couldn't find photos for this address. Give us a call and we'll help you out!";
      document.getElementById('resultAction').innerHTML = \`
        <a href="tel:\${PHONE_NUMBER}" class="btn btn-call">
          📞 Call Us: \${PHONE_NUMBER}
        </a>
        <div><a href="#" class="reset-link" onclick="event.preventDefault(); resetForm();">← Try Another Address</a></div>
      \`;
    }

    function showError() {
      const result = document.getElementById('result');
      result.className = 'result error';
      result.style.display = 'block';

      document.getElementById('resultTitle').textContent = 'Search Error';
      document.getElementById('resultMessage').textContent =
        'Something went wrong. Please try again or give us a call.';
      document.getElementById('resultAction').innerHTML = \`
        <a href="tel:\${PHONE_NUMBER}" class="btn btn-call">
          📞 Call Us: \${PHONE_NUMBER}
        </a>
        <div><a href="#" class="reset-link" onclick="event.preventDefault(); resetForm();">← Try Again</a></div>
      \`;
    }

    function resetForm() {
      document.getElementById('searchForm').style.display = 'block';
      document.getElementById('result').style.display = 'none';
      document.getElementById('address').value = '';
      document.getElementById('address').focus();
    }

    // Allow Enter key to submit
    document.getElementById('address').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchAddress();
      }
    });
  </script>
</body>
</html>`;
}

export async function handler(event, context) {
  try {
    // Get tenant parameter from query string
    const { tenant } = event.queryStringParameters || {};

    if (!tenant) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h1>Missing Tenant Parameter</h1>
              <p>Please provide a tenant parameter in the URL:</p>
              <code>?tenant=budroofing</code>
            </body>
          </html>
        `
      };
    }

    // Load tenant configuration
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[tenant];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h1>Tenant Not Found</h1>
              <p>The tenant "${tenant}" does not exist.</p>
              <p>Available tenants: ${Object.keys(config.tenants).join(', ')}</p>
            </body>
          </html>
        `
      };
    }

    // Generate and return HTML
    const html = generateHTML(tenantConfig);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: html
    };

  } catch (error) {
    console.error('Page generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1>Error</h1>
            <p>Failed to generate page: ${error.message}</p>
          </body>
        </html>
      `
    };
  }
}
