export const initialState = {
    todos: [],
    editingTodoId: null,
    filter: "all",
};

export function todoReducer(state = initialState, action) {
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
        case "SET_FILTER":
            return { ...state, filter: action.filter };
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
