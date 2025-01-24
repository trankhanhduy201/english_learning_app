import { initialState as authInitialState } from "../slices/authSlice";

export const setUserInfoReducer = (state, action) => ({...state, userInfo: action.payload});

export const clearUserReducer = (state, action) => ({...state, userInfo: null});

export const setAuthReducer = (state, action) => action.payload;

export const clearAuthReducer = (state, action) => authInitialState;

