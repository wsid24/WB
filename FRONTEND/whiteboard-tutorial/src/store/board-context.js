import { createContext } from "react";

const boardContext = createContext({
  activeToolItem: "",
  toolActionType: "",
  elements: [],
  history: [[]],
  index: 0,
  boardMouseDownHandler: () => {},
  changeToolHandler: () => {},
  boardMouseMoveHandler: () => {},
  boardMouseUpHandler: () => {},
  clearAll: () => {},
  addImage: () => {},
  selectedElementIds: [],
  selectElements: () => {},
  moveSelectedBy: () => {},
  finishMove: () => {},
  deleteSelected: () => {},
});

export default boardContext;
