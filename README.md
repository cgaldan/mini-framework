# Mini Framework

A small browser JavaScript framework built from scratch, without React, Vue,
Angular, or another frontend framework. The repository also includes a TodoMVC
application that uses the framework as the main proof of the required features:
DOM abstraction, event handling, state management, and routing.

## Requirements

- Node.js, for running the tests.
- Go 1.22+ on your `PATH`, for the tiny static server in `main.go`. (optional if you use a different static server)

There are no runtime frontend dependencies.

## Commands

Run the app from the repository root:

```sh
npm start
```

Open [http://localhost:8000/](http://localhost:8000/). To use a different port:

```sh
PORT=3000 npm start
```

Run the automated checks:

```sh
npm test
```

## What Is In The Repository

- `src/framework/` contains the framework source.
- `src/todomvc/` contains the TodoMVC application built with the framework.
- `index.html` is the single browser entry point and mounts the TodoMVC app.
- `docs/framework.md` contains the detailed framework guide and API reference.
- `tests/` contains focused checks for the framework lifecycle and TodoMVC behavior.

## Framework At A Glance

```js
import { createApp, createRouter, createStore, h } from "./src/framework/index.js";

function reducer(state = { count: 0 }, action) {
    if (action.type === "INCREMENT") {
        return { count: state.count + 1 };
    }

    return state;
}

const store = createStore(reducer, { count: 0 });
const router = createRouter({
    "/": () => {},
});

createApp({
    root: document.getElementById("app"),
    router,
    store,
    view: state => h("button", {
        className: "counter",
        onClick: () => store.dispatch({ type: "INCREMENT" }),
    }, `Count: ${state.count}`),
}).mount();
```

The framework uses plain JavaScript modules. Views return virtual nodes created
with `createVDOM()`. Event handlers are declared as virtual node
attributes such as `onClick`, state updates flow through a small reducer store,
and route changes notify the app lifecycle so it can patch the DOM.

## TodoMVC App

The TodoMVC app is served at `/` and loaded by `index.html`. It lives in
`src/todomvc/`:

- `main.js` creates the store, router, and app lifecycle.
- `reducer.js` stores todos, editing state, active page, and active filter.
- `views.js` builds the pages and TodoMVC UI with framework virtual nodes.
- `styles.css` provides the TodoMVC presentation.

To inspect the app, run `npm start`, open the browser, then use the top
navigation.

Todo creation, toggling, editing, deletion, clearing completed todos, and
filter navigation all use framework APIs. Application code does not call
`document.querySelector()` or `addEventListener()` for TodoMVC behavior.

## Framework Guide

Read the [framework guide](docs/framework.md) for examples of the DOM abstraction, events, store,
router, app lifecycle, and TodoMVC integration.