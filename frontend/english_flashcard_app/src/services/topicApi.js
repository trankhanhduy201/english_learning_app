import { callApi } from "./apiService";

export const getTopics = async () => {
  return await callApi('topics', {
    method: 'GET'
  });
}

export const getTopicById = async (id) => {
  return await callApi(`/topics/${id}`, {
    method: 'GET'
  });
};

export const updateTopic = async (id, datas, options = {}) => {
  return await callApi(`/topics/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(datas),
    ...options
  });
}