const axios = require('axios');
require('dotenv').config();

const { NETHUNT_API_KEY, NETHUNT_EMAIL } = process.env;

if (!NETHUNT_API_KEY || !NETHUNT_EMAIL) {
  throw new Error('NetHunt API Key and Email must be provided in .env file');
}

const credentials = Buffer.from(`${NETHUNT_EMAIL}:${NETHUNT_API_KEY}`).toString('base64');

const apiClient = axios.create({
  baseURL: 'https://nethunt.com/api/v1',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all records from a specific NetHunt folder using the internal command API.
 * @param {string} folderId The ID of the folder to fetch records from.
 * @returns {Promise<Array>} A promise that resolves to an array of records.
 */
const getRecordsFromFolder = async (folderId) => {
  try {
    const response = await apiClient.get(`/zapier/searches/find-record/${folderId}`, {
      params: {
        query: 'created:',
        limit: 99999999
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching records from folder ${folderId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Lists all folders accessible by the user.
 * @returns {Promise<Array>} A promise that resolves to an array of folder objects.
 */
const listFolders = async () => {
  try {
    const response = await apiClient.get('/zapier/triggers/readable-folder');
    return response.data;
  } catch (error) {
    console.error('Error listing folders:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches the timeline (history) for a specific record from NetHunt.
 * @param {string} recordId The ID of the record to fetch timeline for.
 * @returns {Promise<Array>} A promise that resolves to an array of timeline events.
 */
const getRecordTimeline = async (recordId) => {
  try {
    const response = await apiClient.get(`/records/${recordId}/timeline`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching timeline for record ${recordId}:`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getRecordsFromFolder,
  listFolders,
  getRecordTimeline,
}; 