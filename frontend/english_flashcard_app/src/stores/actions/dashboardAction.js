import * as dashboardApi from "../../services/dashboardApi";
import {
  createThunkWithCallback,
  rejectWithErrorValue,
} from "./commonAction";

export const getDashboardSummaryThunk = createThunkWithCallback(
  "dashboard/getSummary",
  async (_, { dispatch, rejectWithValue }) => {
    const response = await dashboardApi.getDashboardSummary();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    return response;
  },
);
