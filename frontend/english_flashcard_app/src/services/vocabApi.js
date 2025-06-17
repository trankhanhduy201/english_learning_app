import { callApi } from "./apiService";

const getQueryString = (topicId) => {
  const searchParams = new URLSearchParams({ topic_id: topicId });
  return searchParams.toString();
}

export const getVocabs = async (topicId, options = {}) => {
  return await callApi(`vocabularies?${ getQueryString(topicId) }`, {
    method: "GET",
    ...options
  });
};

export const getVocab = async (id, options = {}) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "GET",
    ...options
  });
};

export const updateVocab = async (id, datas, options = {}) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "PUT",
    body: JSON.stringify(datas),
    ...options
  });
};

export const createVocab = async (datas, options = {}) => {
  return await callApi(`vocabularies/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options
  });
};

export const importVocabs = async (datas, options = {}) => {
  return await callApi(`vocabularies/import/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options
  });
};

export const deleteVocab = async (id, options = {}) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "DELETE",
    ...options
  });
};

export const deleteAllVocabs = async (topicId, options = {}) => {
  return await callApi(`vocabularies/delete/?${ getQueryString(topicId) }`, {
    method: "POST",
    ...options
  });
};