# CompanyCam API - Complete Overview

Based on research of the API documentation and testing with live data, here's what's available:

## 🗺️ Maps & Geolocation

**YES - CompanyCam has robust geolocation support:**

- **Project Coordinates**: Every project has a `coordinates` object with `lat`/`lon`
- **Photo Coordinates**: Photos can include GPS coordinates from where they were captured
- **Geofence**: Projects support `geofence` arrays (polygon of lat/lon points to define project boundaries)
- **No dedicated "maps endpoint"**, but you can:
  - Filter projects by location using the coordinates in each project
  - Build your own map view using the coordinate data
  - Photos include coordinates for mapping photo locations

**Example from live data:**
```json
"coordinates": {
  "lat": 38.94167621886764,
  "lon": -94.6113908663392
}
```

## 📋 Complete Project Schema

Here's the full structure of a Project record (based on real data):

```json
{
  "id": "93065140",                    // Unique project ID
  "company_id": "995999",               // Your company
  "creator_id": "2880463",              // Who created it
  "creator_type": "User",
  "creator_name": "Eriks Sics",
  "integration_relation_id": null,
  "status": "active",                   // active/deleted
  "archived": false,
  "public": true,                       // Public timeline enabled
  "name": null,                         // Project name (optional)

  // Address object
  "address": {
    "street_address_1": "10304 Overbrook Rd",
    "street_address_2": null,
    "city": "Leawood",
    "state": "KS",
    "postal_code": "66206",
    "country": "US"
  },

  // Geolocation
  "coordinates": {
    "lat": 38.94167621886764,
    "lon": -94.6113908663392
  },
  "geofence": [],                      // Array of lat/lon boundary points

  // URLs
  "slug": "FS2ZxTFTF7kgVMeJ",
  "project_url": "https://app.companycam.com/projects/93065140",
  "public_url": "https://app.companycam.com/timeline/FS2ZxTFTF7kgVMeJ",
  "embedded_project_url": "https://app.companycam.com/embed/projects/FS2ZxTFTF7kgVMeJ",
  "capture_photo_deeplink": "ccam://camera/93065140/...",

  // Media
  "feature_image": [],                 // Featured photo URIs
  "photo_count": 0,

  // Integrations
  "integrations": [
    {
      "type": "GoogleDrive",
      "relation_id": "1tlVvGBws7Y96MX94sJyBmuN4C5iCvjZF"
    }
  ],

  // Other
  "primary_contact": null,
  "notepad": null,                     // Project notes
  "created_at": 1761255300,           // Unix timestamp
  "updated_at": 1761255359
}
```

## 🔌 Main API Endpoints

**Base URL:** `https://api.companycam.com/v2/`

### Projects
- `GET /projects` - List projects
  - Params: `page`, `per_page`, `query` (filter by name/address), `modified_since` (ISO8601)
- `POST /projects` - Create project
- `GET /projects/:id` - Get single project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `PUT /projects/:id/restore` - Restore deleted project

### Photos
- `GET /projects/:project_id/photos` - List photos
  - Params: `page`, `per_page`, `start_date`, `end_date` (unix), `user_ids`, `group_ids`, `tag_ids`
- `POST /projects/:project_id/photos` - Upload photo
  - Body: `uri`, `captured_at` (unix), `coordinates` (lat/lon)
- `GET /photos/:id` - Get single photo
- `PUT /photos/:id` - Update photo

**Photo Schema:**
```json
{
  "id": "...",
  "company_id": "...",
  "creator_id": "...",
  "project_id": "...",
  "processing_status": "...",
  "coordinates": [lat, lon],        // Photo GPS location
  "urls": [],                        // Array of different sizes
  "hash": "...",
  "internal": false,
  "photo_url": "...",
  "captured_at": 1234567890,
  "created_at": 1234567890,
  "updated_at": 1234567890
}
```

### Videos
- `GET /projects/:project_id/videos` - List videos
- Similar structure to photos

### Documents
- `GET /projects/:project_id/documents` - List documents
- `POST /projects/:project_id/documents` - Upload document

### Labels (Tags)
- `GET /projects/:project_id/labels` - Get project labels
- `GET /tags` - List all company tags
- Tags can be used to categorize projects ("Door Hanger", "Completed", etc.)

### Users
- `GET /users/current` - Get current user info

### Webhooks
- `GET /webhooks` - List webhooks
- `POST /webhooks` - Create webhook
- Events: project.created, photo.uploaded, photo.tagged, project.labeled

## 🎯 Interesting Capabilities

1. **Integration Support**: Projects can link to Google Drive folders
2. **Deep Links**: Mobile app deep links for capturing photos (`ccam://camera/...`)
3. **Public Timelines**: Projects can be made public with shareable URLs
4. **Embedded Views**: Iframe embeds available (`embedded_project_url`)
5. **Webhooks**: Real-time event notifications
6. **Geofencing**: Define project boundaries with polygon coordinates
7. **Filtering**: Query by date ranges, tags, users, geographic data

## 🚀 Potential Use Cases for Camvasser

1. **Map View**: Build a map showing all projects using the coordinates data
2. **Proximity Search**: Find projects near a given address using lat/lon
3. **Geofence Alerts**: Create alerts when photos are taken outside project geofence
4. **Integration Sync**: Pull data from Google Drive integrations
5. **Webhook Monitoring**: Real-time notifications when new photos are uploaded
6. **Photo Timeline**: Display photos on a map based on their GPS coordinates
7. **Route Optimization**: Use coordinates to plan field visit routes

## 📝 Notes

- **No dedicated maps API endpoint** - you build maps using coordinate data
- **Videos stored separately** - they're not in the photos endpoint
- **Rate limits apply** - check docs for current limits
- **OAuth 2.0 available** - for multi-tenant auth (currently using API tokens)
- **Pagination** - use `page` and `per_page` params for large datasets

## 📚 Official Documentation

- **Main Docs**: https://docs.companycam.com/docs
- **API Reference**: https://docs.companycam.com/reference
- **GitHub OpenAPI Spec**: https://github.com/CompanyCam/openapi-spec
- **Getting Started**: https://docs.companycam.com/docs/getting-started
- **Webhooks**: https://docs.companycam.com/docs/webhooks-1
