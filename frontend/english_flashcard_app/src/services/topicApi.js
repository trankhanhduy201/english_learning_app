import { callApi } from "./apiService";

export const getTopics = async (filters, options = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  return await callApi(`topics?${queryString}`, {
    method: "GET",
    ...options,
  });
};

export const getTopicById = async (id, options = {}) => {
  return await callApi(`topics/${id}`, {
    method: "GET",
    ...options,
  });
};

export const createTopic = async (datas, options = {}) => {
  return await callApi(`topics/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const updateTopic = async (id, datas, options = {}) => {
  return await callApi(`topics/${id}/`, {
    method: "PUT",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const deleteTopic = async (id, options = {}) => {
  return await callApi(`topics/${id}/`, {
    method: "DELETE",
    ...options,
  });
};

export const deleteTopics = async (options = {}) => {
  return await callApi(`topics/delete/`, {
    method: "POST",
    ...options,
  });
};
