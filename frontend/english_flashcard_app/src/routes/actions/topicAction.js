import { redirect } from "react-router-dom";
import store from "../../stores/store";
import { 
  createTopicThunk, 
  updateTopicThunk, 
  deleteTopicThunk, 
  deleteTopicsThunk 
} from "../../stores/thunks/topicsThunk";

const updateTopic = async (topicId, data) => {
  try {
    return await store.dispatch(updateTopicThunk({ topicId, data })).unwrap();
  } catch (err) {
    return err;
  }
}

const deleteTopic = async (topicId) => {
  try {
    await store.dispatch(deleteTopicThunk({ topicId })).unwrap();
    return redirect('/topics');
  } catch (err) {
    return err;
  }
}

export const editTopic = async ({ request, params }) => {
  const formData = await request.formData();
  const updateData = Object.fromEntries(formData);

  if (params.action === 'delete') {
    return deleteTopic(params.topicId);
  }

	return await updateTopic(params.topicId, updateData);
}

export const createTopic = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const result = await store.dispatch(createTopicThunk({ data })).unwrap();
    return redirect(`/topic/${result.data.id}`);
  } catch (err) {
    return err;
  }
}

export const deleteTopics = async () => {
  try {
    return await store.dispatch(deleteTopicsThunk()).unwrap();
  } catch (err) {
    return err;
  }
}
