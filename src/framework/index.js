import pkg from "../../package.json" with { type: "json" };

export const version = pkg.version;

export { createApp } from "./app.js";
export { createVDOM, createVDOM as h, fragment, VDOM } from "./vdom.js";
export { createElement, patch, render } from "./render.js";
export { createRouter, Router } from "./router.js";
export { createStore, combineReducers, Store } from "./store.js";
export { on, off } from "./events.js";