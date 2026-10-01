import store from "../../stores/store";
import { getDashboardSummaryThunk } from "../../stores/actions/dashboardAction";

export const getDashboardSummaryLoader = async () => {
  try {
    const dashboardSummaryPromise = store
      .dispatch(getDashboardSummaryThunk())
      .unwrap()
      .then((resp) => resp.data);
    return { dashboardSummaryPromise };
  } catch (error) {
    throw new Response("", { status: 400 });
  }
};
