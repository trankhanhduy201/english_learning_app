export const setAlertReducer = (state, action) => [...state, ...[ action.payload ]];

export const clearAlertReducer = (state, action) => state.filter((value, index) => index != action.payload);
