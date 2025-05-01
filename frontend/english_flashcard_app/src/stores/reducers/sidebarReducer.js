export const setToggleSidebarReducer = (state, action) => ({
  ...state,
  isOpen: !state.isOpen,
});
