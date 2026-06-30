import { redirect } from "react-router-dom";
import store from "../../stores/store";
import {
  createTopicThunk,
  updateTopicThunk,
  deleteTopicThunk,
  deleteTopicsThunk,
  updateTopicMembersThunk,
  memberInteractTopicThunk
} from "../../stores/actions/topicAction";
import { blobToBase64 } from "../../commons/images";
import { validateTopicDetail } from "../../validations/topicValidation";
import { validateTopicMemberUpdate } from "../../validations/topicMemberValidation";

const updateTopicMembers = async (topicId, data) => {
  try {
    return await store.dispatch(updateTopicMembersThunk({ topicId, data })).unwrap();
  } catch (err) {
    return err;
  }
};

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
}

const memberInteractTopic = async (topicId, action) => {
  try {
    return await store.dispatch(memberInteractTopicThunk({ topicId, action })).unwrap();
  } catch (err) {
    return err;
  }
}

const getValidatedTopicPayload = async (request) => {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const { validatedData, errors } = await validateTopicDetail(rawData);
  if (errors) {
    return {
      status: "error",
      errors,
    };
  }

  const removeAvatar = validatedData.image_remove;
  delete validatedData.image_remove;

  if (removeAvatar) {
    validatedData.upload_image = null;
  } else if (validatedData.upload_image) {
    validatedData.upload_image = await blobToBase64(validatedData.upload_image);
  } else {
    delete validatedData.upload_image;
  }

  return validatedData;
};

export const createTopic = async ({ request }) => {
  const data = await getValidatedTopicPayload(request);
  if (data?.status === "error") return data;
  try {
    const result = await store.dispatch(createTopicThunk({ data })).unwrap();
    return redirect(`/topic/${result.data.id}`);
  } catch (err) {
    return err;
  }
};

export const editTopic = async ({ request, params }) => {
  if (params.action === "delete") {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo");
    return deleteTopic(params.topicId, redirectTo);
  }

  if (['subcribe', 'unsubcribe'].includes(params.action)) {
    return await memberInteractTopic(params.topicId, params.action);
  }

  const updateData = await getValidatedTopicPayload(request);
  if (updateData?.status === "error") return updateData;
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

export const updateMembers = async ({ request, params }) => {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const { validatedData, errors } = await validateTopicMemberUpdate(rawData);
  if (errors) {
    return {
      status: "error",
      errors,
    };
  }

  try {
    return await updateTopicMembers(params.topicId, validatedData.updating_member_data);
  } catch (_e) {
    return {
      error: "Can not update topic members",
    };
  }
};