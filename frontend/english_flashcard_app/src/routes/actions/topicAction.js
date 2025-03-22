import * as topicApi from "../../services/topicApi";

export const editTopic = async ({ request, params }) => {
  const formData = await request.formData();
  const updateTopic = Object.fromEntries(formData);

  if (params.action === 'delete') {
    await topicApi.deleteTopic(params.topicId, { throwEx: false });
    return { 
      status: 'success',
      data: { id: params.topicId }
    };
  }
  
  if (params.topicId === 'new') {
    return await topicApi.createTopic(updateTopic, { throwEx: false });
  }

	return await topicApi.updateTopic(params.topicId, updateTopic, { throwEx: false });
}