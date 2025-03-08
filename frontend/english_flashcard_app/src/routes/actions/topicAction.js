
import * as topicApi from "../../services/topicApi";

export const editTopic = async ({ request, params }) => {
  const formData = await request.formData();
  const updateTopic = Object.fromEntries(formData);
	return await topicApi.updateTopic(params.topicId, updateTopic, { throwEx: false });
}