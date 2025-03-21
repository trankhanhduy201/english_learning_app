import { callApi } from "./apiService";

export const getVocabs = async (topicId, lang = 'en') => {
  const searchParams = new URLSearchParams({ topic_id: topicId, lang });
  return await callApi('vocabularies?' + searchParams.toString(), {
    method: 'GET'
  });
}

export const getVocab = async (id) => {
  return await callApi(`vocabularies/${id}/`, {
    method: 'GET'
  });
}

export const updateVocab = async (id, datas, options = {}) => {
  return await callApi(`/vocabularies/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(datas),
    ...options
  });
}

export const createVocab = async (datas, options = {}) => {
  return await callApi(`/vocabularies/`, {
    method: 'POST',
    body: JSON.stringify(datas),
    ...options
  });
}

export const deleteVocab = async (id, options = {}) => {
  return await callApi(`/vocabularies/${id}/`, {
    method: 'DELETE'
  });
}