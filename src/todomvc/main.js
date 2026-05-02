import { render, patch } from "../framework/render.js";
import { createVDOM } from "../framework/vdom.js";
import { version } from "../framework/index.js";
import { eventManager } from "../framework/events.js";
import { createStore } from "../framework/store.js";

const root = document.getElementById("todo-app");
eventManager.init(root);

const initialState = {
    todos: [],
    editingTodoId: null,
};

function todoReducer(state = initialState, action) {
    switch (action.type) {
        case "@@INIT":
            return state;
        case "ADD_TODO": {
            const text = action.text.trim();
            if (!text) return state;
            return {
                ...state,
                todos: [
                    ...state.todos,
                    { id: action.id, text, completed: false },
                ],
            };
        }
        case "TOGGLE_TODO":
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
                ),
            };
        case "REMOVE_TODO":
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.id),
            };
        case "START_EDITING":
            return { ...state, editingTodoId: action.id };
        case "CANCEL_EDIT":
            return { ...state, editingTodoId: null };
        case "COMMIT_EDIT": {
            const text = action.text.trim();
            if (!text) {
                return {
                    ...state,
                    todos: state.todos.filter(todo => todo.id !== action.id),
                    editingTodoId: null,
                };
            }
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.id ? { ...todo, text } : todo
                ),
                editingTodoId: null,
            };
        }
        default:
            return state;
    }
}

const store = createStore(todoReducer, initialState);

let currentVDOM = App(store.getState());
render(currentVDOM, root);

store.subscribe(() => {
    const newVDOM = App(store.getState());
    patch(root, currentVDOM, newVDOM);
    currentVDOM = newVDOM;
});

function App(state) {
    return createVDOM("div", { className: "app-shell" },
        createVDOM("div", { className: "ambient-glow ambient-glow--one" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--two" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--three" }),
        createVDOM("section", { className: "todoapp" },
            Header(),
            MainContent(state),
        ),
        createVDOM("footer", { className: "info" },
            createVDOM("p", {}, `Built with custom Mini framework v${version}`),
            createVDOM("p", {}, `All rights reserved © ${new Date().getFullYear()}`),
        ),
    );
}

function Header() {
    return createVDOM("header", { className: "header" },
        createVDOM("h1", {}, "ToDo MVC"),
    );
}

function MainContent(state) {
    return createVDOM("section", { className: "main" },
        createVDOM("ul", { className: "todo-list" },
            ...state.todos.map((todo, index) => TodoItem(state, todo, index)),
            NewTodoItem(),
        ),
    );
}

function TodoItem(state, todo, index) {
    const classNames = [
        todo.completed ? "completed" : "",
        state.editingTodoId === todo.id ? "editing" : "",
        `todo-note--${(index % 4) + 1}`,
    ].filter(Boolean).join(" ");

    return createVDOM("li", { className: classNames },
        createVDOM("div", { className: "view" },
            createVDOM("input", {
                className: "toggle",
                type: "checkbox",
                checked: todo.completed,
                onChange: () => store.dispatch({ type: "TOGGLE_TODO", id: todo.id }),
            }),
            createVDOM("label", { onDblClick: () => store.dispatch({ type: "START_EDITING", id: todo.id }) }, todo.text),
            createVDOM("button", {
                className: "destroy",
                onClick: () => store.dispatch({ type: "REMOVE_TODO", id: todo.id }),
            }),
        ),
        state.editingTodoId === todo.id
            ? createVDOM("input", {
                className: "edit",
                value: todo.text,
                onKeyDown: event => handleEditKeyDown(event, todo.id),
                onFocusOut: event => {
                    if (store.getState().editingTodoId !== todo.id) return;
                    store.dispatch({
                        type: "COMMIT_EDIT",
                        id: todo.id,
                        text: event.target.value,
                    });
                },
            })
            : null,
    );
}

function NewTodoItem() {
    return createVDOM("li", { className: "todo-draft" },
        createVDOM("textarea", {
            className: "new-todo",
            placeholder: "What needs to be done?",
            rows: "4",
            autoFocus: true,
        }),
        createVDOM("button", { className: "add-todo", onClick: addTodo }, "+"),
    );
}

function addTodo() {
    const input = document.querySelector(".new-todo");
    const text = input.value.trim();

    if (!text) return;

    store.dispatch({
        type: "ADD_TODO",
        id: Date.now(),
        text: text,
    });
    input.value = "";
}

function handleEditKeyDown(event, id) {
    if (event.key === "Enter") {
        store.dispatch({
            type: "COMMIT_EDIT",
            id,
            text: event.target.value,
        });
    }
    if (event.key === "Escape") {
        store.dispatch({ type: "CANCEL_EDIT" });
    }
}
