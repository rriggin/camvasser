import { PrismaClient } from '@prisma/client';
import { fetchProjectLabels } from './companycam-api.js';

const prisma = new PrismaClient();

/**
 * Sync a CompanyCam project to the local database
 * @param {Object} projectData - Raw project data from CompanyCam API
 * @param {string} tenant - Tenant identifier (e.g., "budroofing")
 * @param {string} apiToken - CompanyCam API token for fetching labels
 * @returns {Promise<Object>} Synced project with labels
 */
export async function syncProject(projectData, tenant, apiToken) {
  try {
    // Fetch labels for this project
    const labels = await fetchProjectLabels(projectData.id, apiToken);

    // Upsert project data
    const project = await prisma.project.upsert({
      where: { id: projectData.id },
      update: {
        tenant,
        address: projectData.address?.street_address_1,
        city: projectData.address?.city,
        state: projectData.address?.state,
        postalCode: projectData.address?.postal_code,
        name: projectData.name,
        status: projectData.status,
        photoCount: projectData.photo_count || 0,
        publicUrl: projectData.public_url,
        coordinates: projectData.coordinates ? {
          lat: projectData.coordinates.lat,
          lon: projectData.coordinates.lon
        } : null,
        lastSyncedAt: new Date()
      },
      create: {
        id: projectData.id,
        tenant,
        address: projectData.address?.street_address_1,
        city: projectData.address?.city,
        state: projectData.address?.state,
        postalCode: projectData.address?.postal_code,
        name: projectData.name,
        status: projectData.status,
        photoCount: projectData.photo_count || 0,
        publicUrl: projectData.public_url,
        coordinates: projectData.coordinates ? {
          lat: projectData.coordinates.lat,
          lon: projectData.coordinates.lon
        } : null,
        lastSyncedAt: new Date(),
        createdAt: new Date()
      }
    });

    // Delete existing labels for this project
    await prisma.projectLabel.deleteMany({
      where: { projectId: projectData.id }
    });

    // Insert new labels
    if (labels.length > 0) {
      await prisma.projectLabel.createMany({
        data: labels.map(label => ({
          projectId: projectData.id,
          labelId: label.id,
          displayValue: label.display_value,
          value: label.value,
          tagType: label.tag_type
        }))
      });
    }

    // Fetch and return the complete project with labels
    return await prisma.project.findUnique({
      where: { id: projectData.id },
      include: { labels: true }
    });
  } catch (error) {
    console.error('Error syncing project:', error);
    throw error;
  }
}

/**
 * Get a project from local database
 * @param {string} projectId - CompanyCam project ID
 * @returns {Promise<Object|null>} Project with labels or null
 */
export async function getProject(projectId) {
  try {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: { labels: true }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Search for projects by address (locally cached)
 * @param {string} address - Address to search for
 * @param {string} tenant - Tenant identifier
 * @returns {Promise<Array>} Matching projects with labels
 */
export async function searchProjectsByAddress(address, tenant) {
  try {
    const searchLower = address.toLowerCase().trim();

    return await prisma.project.findMany({
      where: {
        tenant,
        address: {
          contains: searchLower,
          mode: 'insensitive'
        }
      },
      include: { labels: true },
      orderBy: { lastSyncedAt: 'desc' }
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}

/**
 * Get projects by label value
 * @param {string} labelValue - Label value to filter by (e.g., "door hanger")
 * @param {string} tenant - Tenant identifier
 * @returns {Promise<Array>} Projects with the specified label
 */
export async function getProjectsByLabel(labelValue, tenant) {
  try {
    return await prisma.project.findMany({
      where: {
        tenant,
        labels: {
          some: {
            value: labelValue.toLowerCase()
          }
        }
      },
      include: { labels: true },
      orderBy: { lastSyncedAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching projects by label:', error);
    return [];
  }
}

/**
 * Get all unique labels for a tenant
 * @param {string} tenant - Tenant identifier
 * @returns {Promise<Array>} Unique labels with project counts
 */
export async function getTenantLabels(tenant) {
  try {
    const labels = await prisma.projectLabel.groupBy({
      by: ['value', 'displayValue'],
      where: {
        project: {
          tenant
        }
      },
      _count: {
        value: true
      },
      orderBy: {
        _count: {
          value: 'desc'
        }
      }
    });

    return labels.map(label => ({
      value: label.value,
      displayValue: label.displayValue,
      projectCount: label._count.value
    }));
  } catch (error) {
    console.error('Error fetching tenant labels:', error);
    return [];
  }
}

/**
 * Close Prisma connection (call when done with batch operations)
 */
export async function disconnect() {
  await prisma.$disconnect();
}
