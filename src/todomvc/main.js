import { render } from "../framework/render.js";
import { createVDOM } from "../framework/vdom.js";
import { version } from "../framework/index.js";
import { eventManager } from "../framework/events.js";

const root = document.getElementById("todo-app");
eventManager.init(root);

render(App(), root);

function App() {
    return createVDOM("div", { className: "app-shell"},
        createVDOM("div", { className: "ambient-glow ambient-glow--one" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--two" }),
        createVDOM("div", { className: "ambient-glow ambient-glow--three" }),
        createVDOM("section", { className: "todoapp" },
            Header(),
            MainContent(),
        ),
        createVDOM("footer", { className: "info" },
            createVDOM("p", {}, `Built with custom Mini framework v${version}`),
            createVDOM("p", {}, `All rights reserved © ${new Date().getFullYear()}`),
        ),
    );
}

function Header() {
    return createVDOM("header", { className: "header"},
        createVDOM("h1", {}, "ToDo MVC"),
    );
}

function MainContent() {
    return createVDOM("section", { className: "main" },
        NewTodoItem(),
    );
}

function NewTodoItem() {
    return createVDOM("button", {
            className: "add-todo",
            onClick: () => console.log("BUTTON PRESSED"),
        }, "PRESS ME");
}
