import { createVDOM } from "../framework/vdom.js";
import { version } from "../framework/index.js";
import { router, store } from "./main.js";

let newTodoDraft = "";

export function App(state) {
    return createVDOM("div", { className: "app-shell" },
        createVDOM("div", { className: "ambient-glow ambient-glow--one" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--two" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--three" }),
        SiteNav(state),
        PagePanel("home", state.page,
            HomePage(),
        ),
        createVDOM("section", {
            className: "todoapp",
            style: { display: state.page === "todos" ? "" : "none" },
        },
            Header(),
            MainContent(state),
            Footer(state),
        ),
        PagePanel("about", state.page,
            AboutPage(),
        ),
        PagePanel("not-found", state.page,
            NotFoundPage(),
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

function SiteNav(state) {
    const linkClass = page => [state.page === page && "selected"].filter(Boolean).join(" ");

    return createVDOM("nav", { className: "site-nav" },
        NavLink("/", "Home", linkClass("home")),
        NavLink("/todos", "Todos", linkClass("todos")),
        NavLink("/about", "About", linkClass("about")),
    );
}

function NavLink(path, label, className) {
    return createVDOM("a", {
        href: `#${path}`,
        className,
        onClick: event => {
            event.preventDefault();
            router.navigate(path);
        },
    }, label);
}

function PagePanel(page, activePage, ...children) {
    return createVDOM("section", {
        className: `page-panel page-panel--${page}`,
        style: { display: activePage === page ? "" : "none" },
    }, ...children);
}

function HomePage() {
    return createVDOM("div", { className: "page-card" },
        createVDOM("h1", {}, "ToDoMVC"),
        createVDOM("p", {}, "A small demo todoMVC app for testing my mini framework."),
        createVDOM("button", { className: "page-action", onClick: () => router.navigate("/todos") }, "Open Todos"),
    );
}

function AboutPage() {
    return createVDOM("div", { className: "page-card" },
        createVDOM("h1", {}, "About"),
        createVDOM("p", {}, "This app is built with the custom Mini framework."),
        createVDOM("p", {}, "The router controls these simple pages and the TodoMVC filters."),
    );
}

function NotFoundPage() {
    return createVDOM("div", { className: "page-card" },
        createVDOM("h1", {}, "404 - Not Found"),
        createVDOM("p", {}, "That route does not exist."),
        createVDOM("button", { className: "page-action", onClick: () => router.navigate("/") }, "Go Home"),
    );
}

function MainContent(state) {
    const allCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);
    const visibleTodos = state.todos.filter(todo => {
        if (state.filter === "active") return !todo.completed;
        if (state.filter === "completed") return todo.completed;
        return true;
    });

    return createVDOM("section", { className: "main" },
        state.todos.length > 0
            ? [
                createVDOM("input", {
                    id: "toggle-all",
                    className: "toggle-all",
                    type: "checkbox",
                    checked: allCompleted,
                    onChange: () => store.dispatch({ type: "TOGGLE_ALL_TODOS" }),
                }),
                createVDOM("label", { className: "toggle-all-label", for: "toggle-all" }, "Mark all as complete"),
            ]
            : null,
        createVDOM("ul", { className: "todo-list" },
            ...visibleTodos.map((todo, index) => TodoItem(state, todo, index)),
            NewTodoItem(),
        ),
    );
}

function Footer(state) {
    if (state.todos.length === 0) return null;

    const activeCount = state.todos.filter(t => !t.completed).length;
    const completedCount = state.todos.length - activeCount;
    const f = state.filter;
    const linkClass = key => [f === key && "selected"].filter(Boolean).join(" ");

    return createVDOM("footer", { className: "footer" },
        createVDOM("span", { className: "todo-count" },
            createVDOM("strong", {}, String(activeCount)),
            ` ${activeCount === 1 ? "item" : "items"} left`,
        ),
        createVDOM("ul", { className: "filters" },
            FilterLink("/todos", "All", linkClass("all")),
            FilterLink("/active", "Active", linkClass("active")),
            FilterLink("/completed", "Completed", linkClass("completed")),
        ),
        completedCount > 0
            ? createVDOM("button", {
                className: "clear-completed",
                onClick: () => store.dispatch({ type: "CLEAR_COMPLETED" }),
            }, "Clear completed")
            : null,
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
    const classNames = [
        "todo",
        todo.completed ? "completed" : "",
        state.editingTodoId === todo.id ? "editing" : "",
        `todo-note--${(index % 4) + 1}`,
    ].filter(Boolean).join(" ");

    return createVDOM("li", { className: classNames },
        createVDOM("div", { className: "view" },
            createVDOM("input", {
                id: `todo-toggle-${todo.id}`,
                name: `todo-toggle-${todo.id}`,
                className: "toggle",
                type: "checkbox",
                checked: todo.completed,
                onChange: () => store.dispatch({ type: "TOGGLE_TODO", id: todo.id }),
            }),
            createVDOM("label", {
                for: `todo-toggle-${todo.id}`,
                onDblClick: () => store.dispatch({ type: "START_EDITING", id: todo.id }),
            }, todo.title),
            createVDOM("button", {
                className: "destroy",
                onClick: () => store.dispatch({ type: "REMOVE_TODO", id: todo.id }),
            }),
        ),
        state.editingTodoId === todo.id
            ? createVDOM("textarea", {
                id: `todo-edit-${todo.id}`,
                name: `todo-edit-${todo.id}`,
                className: "edit",
                value: todo.title,
                rows: "4",
                onKeyDown: event => handleEditKeyDown(event, todo.id),
                onFocusOut: event => {
                    if (store.getState().editingTodoId !== todo.id) return;
                    store.dispatch({
                        type: "COMMIT_EDIT",
                        id: todo.id,
                        title: event.target.value,
                    });
                },
            })
            : null,
    );
}

function NewTodoItem() {
    return createVDOM("li", { className: "todo-draft" },
        createVDOM("textarea", {
            id: "new-todo",
            name: "new-todo",
            className: "new-todo",
            placeholder: "What needs to be done?",
            rows: "4",
            autoFocus: true,
            onInput: event => {
                newTodoDraft = event.target.value;
            },
            onKeyDown: handleNewTodoKeyDown,
        }),
        createVDOM("button", {
            className: "add-todo",
            type: "button",
            onClick: () => addTodo(newTodoDraft),
        }, "+"),
    );
}

function addTodo(title) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    store.dispatch({
        type: "ADD_TODO",
        id: Date.now(),
        title: trimmedTitle,
    });

    newTodoDraft = "";
}

function handleNewTodoKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    addTodo(event.target.value);
}

function handleEditKeyDown(event, id) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        store.dispatch({
            type: "COMMIT_EDIT",
            id,
            title: event.target.value,
        });
    }
    if (event.key === "Escape") {
        store.dispatch({ type: "CANCEL_EDIT" });
    }
}
