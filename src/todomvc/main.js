import { render } from "../framework/render.js";
import { createVDOM } from "../framework/vdom.js";
import { version } from "../framework/index.js";

const root = document.getElementById("todo-app");

render( 
    createVDOM("section", { className: "todoapp" }, 
        createVDOM("header", { className: "header" }, 
            createVDOM("h1", {}, "Todo List"), 
            createVDOM("p", { className: "placeholder" }, `Todo app (framework v${version}) - Full implementation comes next.`),
        ),
        createVDOM("footer", { className: "footer" }),
    ), 
    root
);