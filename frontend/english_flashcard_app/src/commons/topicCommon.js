import store from "../stores/store";

export const isFetchedToStore = () => {
  const state = store.getState();
  return state?.topics?.isFetched ?? false;
};

export const getTopicsFromStore = () => {
  const state = store.getState();
  return state?.topics?.data ?? [];
};

export const getTopicFromStore = (topicId) => {
  return (
    getTopicsFromStore().find(
      (topic) => parseInt(topic.id) === parseInt(topicId),
    ) ?? null
  );
};
