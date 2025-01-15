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