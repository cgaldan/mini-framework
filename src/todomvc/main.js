import { createApp, createRouter, createStore } from "../framework/index.js";
import { App } from "./views.js";
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
    "*": () => setPage("not-found"),
};

export const router = createRouter(routes);

const root = document.getElementById("todo-app");
export const app = createApp({
    root,
    router,
    store,
    view: state => App(state),
});

app.mount();