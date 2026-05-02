import { render, patch } from "../framework/render.js";
import { eventManager } from "../framework/events.js";
import { App } from "./views.js";
import { createStore } from "../framework/store.js";
import { todoReducer, initialState } from "./reducer.js";

export const store = createStore(todoReducer, initialState);

const root = document.getElementById("todo-app");
eventManager.init(root);

let currentVDOM = App(store.getState());
render(currentVDOM, root);

store.subscribe(() => {
    const newVDOM = App(store.getState());
    patch(root, currentVDOM, newVDOM);
    currentVDOM = newVDOM;
});