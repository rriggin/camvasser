import axios from 'axios';

/**
 * Fetch labels for a specific CompanyCam project
 * @param {string} projectId - The CompanyCam project ID
 * @param {string} apiToken - The CompanyCam API token
 * @returns {Promise<Array>} Array of label objects
 */
export async function fetchProjectLabels(projectId, apiToken) {
  try {
    const response = await axios.get(
      `https://api.companycam.com/v2/projects/${projectId}/labels`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    return response.data || [];
  } catch (error) {
    // 404 means no labels exist for this project
    if (error.response?.status === 404) {
      return [];
    }

    console.error(`Error fetching labels for project ${projectId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch a project with its labels
 * @param {string} projectId - The CompanyCam project ID
 * @param {string} apiToken - The CompanyCam API token
 * @returns {Promise<Object>} Project object with labels array
 */
export async function fetchProjectWithLabels(projectId, apiToken) {
  try {
    // Fetch project details
    const projectResponse = await axios.get(
      `https://api.companycam.com/v2/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    const project = projectResponse.data;

    // Fetch labels for this project
    const labels = await fetchProjectLabels(projectId, apiToken);

    return {
      ...project,
      labels
    };
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch all labels for a company (across all projects)
 * This can be used to get a list of all available labels
 * @param {string} apiToken - The CompanyCam API token
 * @returns {Promise<Array>} Array of all unique labels
 */
export async function fetchAllCompanyLabels(apiToken) {
  try {
    const response = await axios.get(
      'https://api.companycam.com/v2/tags',
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('Error fetching company labels:', error.message);
    throw error;
  }
}

/**
 * Format labels for storage/display
 * @param {Array} labels - Raw label objects from API
 * @returns {Array} Simplified label objects
 */
export function formatLabels(labels) {
  return labels.map(label => ({
    id: label.id,
    displayValue: label.display_value,
    value: label.value,
    tagType: label.tag_type,
    createdAt: label.created_at
  }));
}
