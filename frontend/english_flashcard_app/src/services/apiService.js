import * as apiConfigs from '../configs/apiConfigs';
import * as cookieUtils from '../utils/cookies';

const API_BASE_URL = apiConfigs.API_BASE_URL;

const checkStatusNoContent = (status) => [204, 304].includes(status);

export const callApi = async (endpoint, options = {}) => {
  const { token } = cookieUtils.getAuthTokens();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options?.header,
    'Content-Type': 'application/json'
  }

  let throwEx = true;
  if (options.throwEx !== undefined) {
    throwEx = options.throwEx;
    delete options.throwEx;
  }

  try {
    let dataJson = {};
    const resp = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers
    });
    
    const contentType = resp.headers.get('Content-Type');
    //const contentLength = resp.headers.get('Content-Length');
    if (!checkStatusNoContent(resp.status) && contentType && contentType.includes('application/json')) {
      dataJson = await resp.json();
    }

    if (throwEx && !resp.ok) {
      const error = new Error(`HTTP error! status: ${resp.status}`);
      error.details = dataJson;
      throw error;
    }
    return dataJson;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}