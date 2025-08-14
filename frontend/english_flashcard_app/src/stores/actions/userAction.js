import { createThunkWithCallback, rejectWithErrorValue } from "./commonAction";
import { setUser } from "../slices/userSlice";
import * as userApi from "../../services/userApi";

export const getInfo = createThunkWithCallback(
  "user/info",
  async (_, { dispatch, rejectWithValue }) => {
    
    const response = await userApi.getInfo();
    if (response.status === "error") {
      return rejectWithErrorValue(dispatch, rejectWithValue, response);
    }
    dispatch(setUser(response.data));
    return response;
  },
);
