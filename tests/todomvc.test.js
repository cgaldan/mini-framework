import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { initialState, todoReducer } from "../src/todomvc/reducer.js";

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function reduce(actions, state = initialState) {
    return actions.reduce((currentState, action) => todoReducer(currentState, action), state);
}

test("TodoMVC reducer adds trimmed todos and ignores blank titles", () => {
    const state = reduce([
        { type: "ADD_TODO", id: 1, title: "  Learn framework  " },
        { type: "ADD_TODO", id: 2, title: "   " },
    ]);
    assert.deepEqual(state.todos, [
        { id: 1, title: "Learn framework", completed: false },
    ]);
});

test("TodoMVC reducer toggles one todo and all todos", () => {
    const withTodos = reduce([
        { type: "ADD_TODO", id: 1, title: "One" },
        { type: "ADD_TODO", id: 2, title: "Two" },
        { type: "TOGGLE_TODO", id: 1 },
    ]);
    assert.equal(withTodos.todos[0].completed, true);
    assert.equal(withTodos.todos[1].completed, false);
    const allCompleted = todoReducer(withTodos, { type: "TOGGLE_ALL_TODOS" });
    assert.equal(allCompleted.todos.every(todo => todo.completed), true);
    const allActive = todoReducer(allCompleted, { type: "TOGGLE_ALL_TODOS" });
    assert.equal(allActive.todos.every(todo => !todo.completed), true);
});

test("TodoMVC reducer edits, cancels, deletes, and clears completed todos", () => {
    const withTodos = reduce([
        { type: "ADD_TODO", id: 1, title: "Keep" },
        { type: "ADD_TODO", id: 2, title: "Remove" },
        { type: "START_EDITING", id: 1 },
        { type: "CANCEL_EDIT" },
        { type: "START_EDITING", id: 1 },
        { type: "COMMIT_EDIT", id: 1, title: "Kept" },
        { type: "TOGGLE_TODO", id: 2 },
        { type: "CLEAR_COMPLETED" },
    ]);
    assert.equal(withTodos.editingTodoId, null);
    assert.deepEqual(withTodos.todos, [
        { id: 1, title: "Kept", completed: false },
    ]);
    const removedByEmptyEdit = reduce([
        { type: "ADD_TODO", id: 1, title: "Draft" },
        { type: "COMMIT_EDIT", id: 1, title: " " },
    ]);
    assert.deepEqual(removedByEmptyEdit.todos, []);
});


test("TodoMVC reducer stores page and filter from router flow", () => {
    const state = todoReducer(initialState, {
        type: "SET_PAGE",
        page: "todos",
        filter: "completed",
    });
    assert.equal(state.page, "todos");
    assert.equal(state.filter, "completed");
});

test("TodoMVC views keep required reference classes, ids, and labels", async () => {
    const source = await readText("src/todomvc/views.js");
    [
        "todoapp",
        "header",
        "new-todo",
        "main",
        "toggle-all",
        "toggle-all-label",
        "todo-list",
        "footer",
        "todo-count",
        "filters",
        "selected",
        "clear-completed",
        "todo",
        "completed",
        "editing",
        "toggle",
        "destroy",
        "edit",
    ].forEach(requiredToken => {
        assert.match(source, new RegExp(`["'\`]${requiredToken}["'\`]`));
    });
    assert.match(source, /id:\s*"toggle-all"/);
    assert.match(source, /for:\s*"toggle-all"/);
    assert.match(source, /for:\s*`todo-toggle-\$\{todo\.id\}`/);
});

test("TodoMVC app behavior avoids raw DOM querying and manual listeners", async () => {
    const source = await readText("src/todomvc/views.js");
    assert.doesNotMatch(source, /document\.querySelector/);
    assert.doesNotMatch(source, /document\.getElementById/);
    assert.doesNotMatch(source, /addEventListener/);
});
