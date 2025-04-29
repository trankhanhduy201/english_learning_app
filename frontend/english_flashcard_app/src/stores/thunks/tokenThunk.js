import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearAuth } from "../slices/authSlice";
import * as authCommon from "../../commons/authCommon";

export const refreshTokenThunk = createAsyncThunk(
	'token/refresh',
	async ({ refreshToken, originalAction }, { dispatch, rejectWithValue }) => {
		try {
			const accessToken = await authCommon.refreshNewToken(refreshToken);
			if (accessToken === false) {
				throw new Error('Can not refresh new access token');
			}
			dispatch(originalAction);
			return {
				status: 'success',
				data: { accessToken }
			}
		} catch (err) {
			dispatch(clearAuth());
			return rejectWithValue({ status: 'error' });
		}
	}
);