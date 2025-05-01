import * as utils from "../../utils/commons";

export const setAlertReducer = (state, action) => [
  ...state,
  ...[{ ...action.payload, idx: utils.getNextMaxId(state, "idx") }],
];

export const clearAlertReducer = (state, action) =>
  state.filter((value) => value.idx != action.payload);
