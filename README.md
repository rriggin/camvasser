# Camvasser

-added cade to project. 

Turn your CompanyCam projects into lead generation machines. A multi-tenant SaaS platform that captures leads before showing project photos.

## Features

- **Multi-tenant support** - Host multiple branded instances from one deployment
- Clean, branded landing pages with custom logos and colors
- Address search → CompanyCam project lookup
- Direct links to project photos
- Call-to-action for projects not found
- Serverless Netlify functions
- Simple YAML configuration (no database required)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure tenants:**

   Edit `tenants.yml` and add your tenant configuration:

   ```yaml
   tenants:
     yourcompany:
       name: "Your Company Name"
       slug: "yourcompany"
       logo: "https://yourwebsite.com/logo.png"
       phone: "555-123-4567"
       colors:
         primary: "#0066CC"
         primaryHover: "#0052A3"
         background: "#1a1a1a"
         logoBackground: "#1a1a1a"
       companycam_api_token_env: "YOURCOMPANY_COMPANYCAM_TOKEN"
       page_title: "View Your Project Photos - Your Company"
       page_subtitle: "Enter your address to view photos"
       heading: "View Your Photos"
       subheading: "Enter your address to view photos from your project."
       og_image: "https://yourwebsite.com/og-image.png"
   ```

3. **Set up environment variables:**

   Create a `.env` file with the CompanyCam API tokens for each tenant:

   ```bash
   # Add a token for each tenant using the env var name from tenants.yml
   YOURCOMPANY_COMPANYCAM_TOKEN=your_api_token_here
   BUDROOFING_COMPANYCAM_TOKEN=another_api_token_here
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

   Access tenant pages at: `http://localhost:8888/.netlify/functions/page?tenant=yourcompany`

5. **Deploy to Netlify:**
   ```bash
   npm run deploy
   ```

## Adding New Tenants

To add a new tenant:

1. Add their configuration to `tenants.yml`
2. Add their CompanyCam API token to `.env` (locally) or Netlify environment variables (production)
3. Share their unique URL: `https://your-site.netlify.app/.netlify/functions/page?tenant=slug`

No code changes or redeployment needed!

## How It Works

1. Customer visits tenant-specific URL with `?tenant=slug` parameter
2. Dynamic HTML is generated with tenant branding from `tenants.yml`
3. Customer enters their address
4. Search function uses tenant-specific CompanyCam API token
5. If found: Shows project details + link to photos
6. If not found: Shows phone number to call

## Project Structure

```
camvasser/
├── public/
│   ├── index.html          # Legacy single-tenant page
│   └── logos/              # Optional local logo storage
├── netlify/
│   └── functions/
│       ├── page.js         # Dynamic multi-tenant page generator
│       └── search.js       # CompanyCam search function
├── tenants.yml             # Multi-tenant configuration
├── netlify.toml            # Netlify configuration
├── .env                    # Local environment variables
└── package.json
```

## Configuration Reference

### Tenant Configuration (`tenants.yml`)

- `name` - Business name displayed in the page
- `slug` - URL-friendly identifier (used in `?tenant=slug`)
- `logo` - Logo URL (can be external URL or local path like `/logos/logo.png`)
- `phone` - Contact phone number for "not found" results
- `colors.primary` - Main brand color (buttons, accents)
- `colors.primaryHover` - Hover state for buttons
- `colors.background` - Page background color
- `colors.logoBackground` - Logo section background
- `companycam_api_token_env` - Name of environment variable containing API token
- `page_title` - Browser tab title
- `page_subtitle` - Meta description for SEO
- `heading` - Main heading on page
- `subheading` - Subtitle text
- `og_image` - Open Graph image for social media previews

## Future Enhancements

- Admin panel for self-service tenant setup
- Custom domain support per tenant
- Analytics and usage tracking
- Photo gallery view
