import { redirect } from "react-router-dom";
import store from "../../stores/store";
import { updateTopicThunk, createTopicThunk, deleteTopicThunk } from "../../stores/thunks/topicsThunk";

const createTopic = async (data) => {
  try {
    const result = await store.dispatch(createTopicThunk({ data })).unwrap();
    return redirect(`/topic/${result.data.id}`);
  } catch (err) {
    return err;
  }
}

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

  if (params.topicId === 'new') {
    return await createTopic(updateData);
  }

  if (params.action === 'delete') {
    return deleteTopic(params.topicId);
  }

	return await updateTopic(params.topicId, updateData);
}