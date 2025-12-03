import { getUser as getUserLocalStorage } from "../commons/localStorage";

export const isTopicOwner = (topicUserId) => {
	if (topicUserId) {
		const userInfo = getUserLocalStorage();
		return topicUserId == userInfo.id;
	}
	return false
}