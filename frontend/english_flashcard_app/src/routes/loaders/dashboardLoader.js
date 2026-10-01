import { getDashboardSummary } from "../../services/dashboardApi";

export const getDashboardSummaryLoader = async () => {
  try {
    const response = await getDashboardSummary({ throwEx: true });
    return { dashboardSummary: response.data };
  } catch (error) {
    throw new Response("", { status: 400 });
  }
};
