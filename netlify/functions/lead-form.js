import { loadTenantConfig } from './lib/tenant-config.js';

export async function handler(event) {
  const { tenant, projectId } = event.queryStringParameters || {};

  if (!tenant) {
    return {
      statusCode: 400,
      body: 'Missing tenant parameter'
    };
  }

  try {
    // Load tenant configuration
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[tenant];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        body: 'Tenant not found'
      };
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us - ${tenantConfig.name}</title>

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
      background: #f5f5f5;
      color: #212529;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%);
      padding: 30px 40px;
      text-align: center;
      color: white;
    }

    .logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
    }

    .company-name {
      font-size: 32px;
      font-weight: 700;
      color: white;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .lead-capture {
      background: white;
      padding: 50px 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
    }

    .lead-capture h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 15px;
      color: #212529;
    }

    .lead-capture .subtitle {
      color: #6C757D;
      font-size: 18px;
      margin-bottom: 35px;
      line-height: 1.6;
    }

    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }

    .input-group label {
      display: block;
      margin-bottom: 8px;
      color: #495057;
      font-weight: 500;
      font-size: 15px;
    }

    .input-group input,
    .input-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E9ECEF;
      border-radius: 8px;
      font-size: 16px;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    .input-group input:focus,
    .input-group textarea:focus {
      outline: none;
      border-color: #28A745;
    }

    .input-group textarea {
      min-height: 120px;
      resize: vertical;
    }

    .btn {
      background: linear-gradient(135deg, #28A745 0%, #20873a 100%);
      color: white;
      padding: 16px 40px;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
      margin-top: 10px;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
    }

    .btn:active {
      transform: translateY(0);
    }

    .success-message {
      display: none;
      background: #D4EDDA;
      border: 2px solid #28A745;
      color: #155724;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: center;
    }

    .success-message.visible {
      display: block;
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #6C757D;
      text-decoration: none;
    }

    .back-link:hover {
      color: #28A745;
    }
  </style>
</head>
<body>
  <div class="header">
    ${tenantConfig.logo ? `<img src="${tenantConfig.logo}" alt="${tenantConfig.name}" class="logo">` : `<div class="company-name">${tenantConfig.name}</div>`}
  </div>

  <div class="container">
    <div class="lead-capture">
      <h1>Get In Touch</h1>
      <p class="subtitle">Ready to start your project? Fill out the form below and we'll get back to you shortly.</p>

      <form id="leadForm">
        <div class="input-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" required>
        </div>

        <div class="input-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" required>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" required>
        </div>

        <div class="input-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" required>
        </div>

        <div class="input-group">
          <label for="message">Message (Optional)</label>
          <textarea id="message" placeholder="Tell us about your project..."></textarea>
        </div>

        <button type="submit" class="btn">Submit</button>
      </form>

      <div class="success-message" id="successMessage">
        <h3>Thank you for contacting us!</h3>
        <p>We'll get back to you shortly.</p>
      </div>

      ${projectId ? `<a href="/.netlify/functions/gallery?tenant=${tenant}&projectId=${projectId}" class="back-link">← Back to Gallery</a>` : ''}
    </div>
  </div>

  <script>
    const tenant = '${tenant}';
    const projectId = '${projectId || ''}';

    document.getElementById('leadForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const leadData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value,
        tenant: tenant,
        projectId: projectId,
        timestamp: new Date().toISOString()
      };

      console.log('Lead captured:', leadData);

      try {
        // Save lead to database
        const response = await fetch('/.netlify/functions/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Failed to save lead:', result);
          alert('There was an error submitting your information. Please try again.');
          return;
        }

        console.log('Lead saved successfully:', result.leadId);

        // Hide form, show success
        document.getElementById('leadForm').style.display = 'none';
        document.getElementById('successMessage').classList.add('visible');

      } catch (error) {
        console.error('Error saving lead:', error);
        alert('There was an error submitting your information. Please try again.');
      }
    });
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: html
    };

  } catch (error) {
    console.error('Error rendering lead form:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}
