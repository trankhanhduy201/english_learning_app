export const setErrorReducer = (state, action) => [...state, ...[ action.payload ]];

export const clearErrorReducer = (state, action) => state.filter((value, index) => index != action.payload);
