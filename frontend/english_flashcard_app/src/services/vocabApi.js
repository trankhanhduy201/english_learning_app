import { callApi } from "./apiService";

const getQueryString = (topicId) => {
  const searchParams = new URLSearchParams({ topic_id: topicId });
  return searchParams.toString();
};

export const getVocabs = async (topicId, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/`, {
    method: "GET",
    ...options,
  });
};

export const getVocab = async (topicId, id, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/${id}/`, {
    method: "GET",
    ...options,
  });
};

export const updateVocab = async (topicId, id, datas, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/${id}/`, {
    method: "PUT",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const createVocab = async (topicId, datas, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const importVocabs = async (topicId, datas, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/import/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const deleteVocab = async (topicId, id, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/${id}/`, {
    method: "DELETE",
    ...options,
  });
};

export const deleteAllVocabs = async (topicId, options = {}) => {
  return await callApi(`topics/${topicId}/vocabularies/bulk-delete/`, {
    method: "DELETE",
    ...options,
  });
};
