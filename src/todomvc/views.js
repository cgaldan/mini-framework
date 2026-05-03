import { createVDOM } from "../framework/vdom.js";
import { version } from "../framework/index.js";
import { router, store } from "./main.js";

export function App(state) {
    return createVDOM("div", { className: "app-shell" },
        createVDOM("div", { className: "ambient-glow ambient-glow--one" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--two" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--three" }),
        createVDOM("section", { className: "todoapp" },
            Header(),
            MainContent(state),
            Footer(state),
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

function Footer(state) {
    const activeCount = state.todos.filter(t => !t.completed).length;
    const f = state.filter;
    const linkClass = key => [f === key && "selected"].filter(Boolean).join(" ");

    return createVDOM("footer", { className: "footer" },
        createVDOM("span", { className: "todo-count" },
            createVDOM("strong", {}, String(activeCount)),
            ` ${activeCount === 1 ? "item" : "items"} left`,
        ),
        createVDOM("ul", { className: "filters" },
            FilterLink("/", "All", linkClass("all")),
            FilterLink("/active", "Active", linkClass("active")),
            FilterLink("/completed", "Completed", linkClass("completed")),
        ),
    );
}

function FilterLink(path, label, className) {
    return createVDOM("li", {},
        createVDOM("a", {
            href: `#${path}`,
            className,
            onClick: event => {
                event.preventDefault();
                router.navigate(path);
            },
        }, label),
    );
}

function TodoItem(state, todo, index) {
    const isHidden =
        (state.filter === "active" && todo.completed) ||
        (state.filter === "completed" && !todo.completed);
    const classNames = [
        todo.completed ? "completed" : "",
        state.editingTodoId === todo.id ? "editing" : "",
        `todo-note--${(index % 4) + 1}`,
    ].filter(Boolean).join(" ");

    return createVDOM("li", { className: classNames, style: { display: isHidden ? "none" : "" } },
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
