import * as apiConfigs from '../configs/apiConfigs';

const API_BASE_URL = apiConfigs.API_BASE_URL;
const API_TOKEN = apiConfigs.API_TOKEN;

export const callApi = async (endpoint, options = {}, throwEx = true) => {
  // const headers = {
  //     Authorization: `Bearer ${API_TOKEN}`,
  //     ...options?.header
  // }

  const headers = {
    ...options?.header,
    'Content-Type': 'application/json'
  }

  try {
    let dataJson = {};
    const resp = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers
    });
    const contentType = resp.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      dataJson = await resp.json();
    }

    if (throwEx && !resp.ok) {
      const error = new Error(`HTTP error! status: ${resp.status}`);
      error.details = dataJson
      throw error;
    }
    return dataJson;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}