import * as transApi from "../../services/transApi";

export const editTrans = async ({ request, params }) => {
  const formData = await request.formData();
  const updateTrans = Object.fromEntries(formData);
  return await transApi.updateTrans(params.transId, {
    ...updateTrans,
    id: params.transId,
  });
};
