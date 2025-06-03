import { callApi } from "./apiService";

const getQueryString = (topicId, lang) => {
  const searchParams = new URLSearchParams({ topic_id: topicId, lang });
  return searchParams.toString();
}

export const getVocabs = async (topicId, lang = "en") => {
  return await callApi(`vocabularies?${ getQueryString(topicId, lang) }`, {
    method: "GET",
  });
};

export const getVocab = async (id) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "GET",
  });
};

export const updateVocab = async (id, datas, options = {}) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "PUT",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const createVocab = async (datas, options = {}) => {
  return await callApi(`vocabularies/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const importVocabs = async (datas, options = {}) => {
  return await callApi(`vocabularies/import/`, {
    method: "POST",
    body: JSON.stringify(datas),
    ...options,
  });
};

export const deleteVocab = async (id, options = {}) => {
  return await callApi(`vocabularies/${id}/`, {
    method: "DELETE",
  });
};

export const deleteAllVocabs = async (topicId, lang, options = {}) => {
  return await callApi(`vocabularies/delete/?${ getQueryString(topicId, lang) }`, {
    method: "POST",
    ...options,
  });
};