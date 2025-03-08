import { callApi } from "./apiService";

export const getVocabs = async (topicId, lang = 'en') => {
  const searchParams = new URLSearchParams({ topic_id: topicId, lang });
  return await callApi('vocabularies?' + searchParams.toString(), {
    method: 'GET'
  });
}

export const getVocab = async (vocabId) => {
  return await callApi(`vocabularies/${vocabId}/`, {
    method: 'GET'
  });
}