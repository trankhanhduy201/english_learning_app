import { redirect } from "react-router-dom";
import store from "../../stores/store";
import {
  createTopicThunk,
  updateTopicThunk,
  deleteTopicThunk,
  deleteTopicsThunk,
} from "../../stores/actions/topicAction";

const updateTopic = async (topicId, data) => {
  try {
    return await store.dispatch(updateTopicThunk({ topicId, data })).unwrap();
  } catch (err) {
    return err;
  }
};

const deleteTopic = async (topicId, redirectTo = null) => {
  try {
    const data = await store.dispatch(deleteTopicThunk({ topicId })).unwrap();
    return redirectTo ? redirect(`/${redirectTo}`) : data;
  } catch (err) {
    return err;
  }
};

export const createTopic = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const result = await store.dispatch(createTopicThunk({ data })).unwrap();
    return redirect(`/topic/${result.data.id}`);
  } catch (err) {
    return err;
  }
};

export const editTopic = async ({ request, params }) => {
  const formData = await request.formData();
  const updateData = Object.fromEntries(formData);

  if (params.action === "delete") {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo");
    return deleteTopic(params.topicId, redirectTo);
  }
  return await updateTopic(params.topicId, updateData);
};

export const deleteTopics = async () => {
  try {
    await store.dispatch(deleteTopicsThunk()).unwrap();
    return redirect(`/topics`);
  } catch (err) {
    return err;
  }
};
