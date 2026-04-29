import { version } from "../framework/index.js";

const root = document.getElementById("todo-app");

root.innerHTML = `
    <section class="todoapp">
        <header class="header">
            <h1>Todo List</h1>
            <p class="placeholder">
                Todo app (framework v${version}) - Full implementation comes next.
            </p>
        </header>
    </section>
`;
