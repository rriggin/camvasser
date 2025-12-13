# Camvasser

Turn your CompanyCam projects into lead generation machines. A multi-tenant SaaS platform that captures leads before showing project photos.

## Features

- **Multi-tenant support** - Host multiple branded instances from one deployment
- Clean, branded landing pages with custom logos and colors
- Address search → CompanyCam project lookup
- Lead capture flows (quizzes, qualification forms)
- Direct links to project photos
- Prospect management with Whitepages enrichment
- Serverless Netlify functions with PostgreSQL (Prisma)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure tenants:**

   Edit `public/tenants.yml` and add your tenant configuration:

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
       heading: "View Your Photos"
       subheading: "Enter your address to view photos from your project."
   ```

3. **Set up environment variables:**

   Create a `.env` file:

   ```bash
   # Database
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...

   # CompanyCam tokens (one per tenant)
   YOURCOMPANY_COMPANYCAM_TOKEN=your_api_token_here
   BUDROOFING_COMPANYCAM_TOKEN=another_api_token_here
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

   Access tenant pages at: `http://localhost:8888/yourcompany`

5. **Deploy to Netlify:**
   ```bash
   npm run deploy
   ```

## URL Structure

All tenant pages use clean URLs via the dynamic router:

- `/:tenant` - Tenant index page
- `/:tenant/photos` - Photo search page
- `/:tenant/instant-roof-quote` - Quote request flow
- `/:tenant/roof-claim-denial` - Insurance claim flow
- `/:tenant/dirty-roof-costs` - Roof cleaning flow
- `/:tenant/roof-spray-vs-sealant-options` - Treatment options flow

## Project Structure

```
camvasser/
├── public/
│   ├── tenants.yml         # Multi-tenant configuration
│   ├── admin.html          # Admin dashboard
│   ├── index.html          # Landing page
│   └── logos/              # Tenant logo storage
├── netlify/
│   └── functions/
│       ├── tenant-router.js    # Dynamic URL router
│       ├── tenant-index.js     # Tenant landing page
│       ├── page.js             # Photo search page
│       ├── flow-*.js           # Lead capture flows
│       ├── get-*.js            # API endpoints (leads, projects, etc.)
│       ├── save-*.js           # Data persistence endpoints
│       └── lib/                # Shared utilities
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/                # Admin utilities
├── tests/                  # Test files
├── docs/                   # Documentation
├── netlify.toml            # Netlify configuration
└── package.json
```

## Adding New Tenants

1. Add configuration to `public/tenants.yml`
2. Add CompanyCam API token to environment variables
3. Add redirect rules to `netlify.toml` (copy existing tenant pattern)
4. Share their URL: `https://your-site.netlify.app/tenant-slug`

## Database Models

- **Lead** - Inbound inquiries from landing pages and flows
- **BusinessUser** - Contractors using the platform
- **Project** - CompanyCam project data (synced)
- **Prospect** - People discovered via Whitepages lookup
- **ProjectLabel** - Tags/statuses from CompanyCam
