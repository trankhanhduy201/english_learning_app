import store from "../../stores/store";
import { updateTopicThunk, createTopicThunk, deleteTopicThunk } from "../../stores/thunks/topicsThunk";

const createTopic = async (data) => {
  const resultAction = await store.dispatch(createTopicThunk({ data }));
  return resultAction.payload;
}

const updateTopic = async (topicId, data) => {
  const resultAction = await store.dispatch(updateTopicThunk({ topicId, data }));
  return resultAction.payload;
}

const deleteTopic = async (topicId) => {
  const resultAction = await store.dispatch(deleteTopicThunk({ topicId}));
  return resultAction.payload;
}

export const editTopic = async ({ request, params }) => {
  const formData = await request.formData();
  const updateData = Object.fromEntries(formData);

  if (params.action === 'delete') {
    return deleteTopic(params.topicId);
  }
  
  if (params.topicId === 'new') {
    return await createTopic(updateData);
  }

	return await updateTopic(params.topicId, updateData);
}