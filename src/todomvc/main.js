import { render, patch } from "../framework/render.js";
import { eventManager } from "../framework/events.js";
import { createRouter } from "../framework/router.js";
import { App } from "./views.js";
import { createStore } from "../framework/store.js";
import { todoReducer, initialState } from "./reducer.js";

export const store = createStore(todoReducer, initialState);

function setPage(page, filter) {
    store.dispatch({ type: "SET_PAGE", page, filter });
}

const routes = {
    "/": () => setPage("home"),
    "/todos": () => setPage("todos", "all"),
    "/active": () => setPage("todos", "active"),
    "/completed": () => setPage("todos", "completed"),
    "/about": () => setPage("about"),
};

export const router = createRouter(routes);
router.register("*", () => setPage("not-found"));
router.handleRouteChange();

const root = document.getElementById("todo-app");
eventManager.init(root);

let currentVDOM = App(store.getState());
render(currentVDOM, root);

store.subscribe(() => {
    const newVDOM = App(store.getState());
    patch(root, currentVDOM, newVDOM);
    currentVDOM = newVDOM;
});