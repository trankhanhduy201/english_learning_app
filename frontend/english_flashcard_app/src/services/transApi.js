import { callApi } from "./apiService";

export const updateTrans = async (id, datas, options = {}) => {
  return await callApi(`/translations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(datas),
    ...options
  });
}