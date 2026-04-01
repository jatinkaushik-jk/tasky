import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useReducer } from "react";

const STORAGE_KEY = "tasky_todos";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  deadlineEnabled: boolean;
  deadline?: string; // ISO string
  reminderTime?: string; // ISO string
  done: boolean;
  createdAt: string; // ISO string
}

type State = {
  todos: Todo[];
  loaded: boolean;
};

type Action =
  | { type: "LOAD"; todos: Todo[] }
  | { type: "ADD"; todo: Todo }
  | {
      type: "UPDATE";
      id: string;
      updates: Partial<Omit<Todo, "id" | "createdAt">>;
    }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_DONE"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { todos: action.todos, loaded: true };
    case "ADD":
      return { ...state, todos: [action.todo, ...state.todos] };
    case "UPDATE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t,
        ),
      };
    case "DELETE":
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    case "TOGGLE_DONE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      };
    default:
      return state;
  }
}

function persist(todos: Todo[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {});
}

export function useTodos() {
  const [state, dispatch] = useReducer(reducer, { todos: [], loaded: false });

  // Load persisted todos on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: Todo[] = JSON.parse(raw);
          dispatch({ type: "LOAD", todos: parsed });
        } else {
          dispatch({ type: "LOAD", todos: [] });
        }
      })
      .catch(() => dispatch({ type: "LOAD", todos: [] }));
  }, []);

  // Persist on every change after load
  useEffect(() => {
    if (state.loaded) {
      persist(state.todos);
    }
  }, [state.todos, state.loaded]);

  const addTodo = useCallback(
    (data: Omit<Todo, "id" | "createdAt" | "done">) => {
      const todo: Todo = {
        ...data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        done: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD", todo });
      return todo;
    },
    [],
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<Omit<Todo, "id" | "createdAt">>) => {
      dispatch({ type: "UPDATE", id, updates });
    },
    [],
  );

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const toggleDone = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_DONE", id });
  }, []);

  const todayTodos = state.todos.filter((t) => {
    const today = new Date();
    // showing only tasks with today deadline not created today
    if (t.deadlineEnabled && t.deadline) {
      const dl = new Date(t.deadline);
      return (
        dl.getFullYear() === today.getFullYear() &&
        dl.getMonth() === today.getMonth() &&
        dl.getDate() === today.getDate()
      );
    }
    return false;
  });

  return {
    todos: state.todos,
    todayTodos,
    loaded: state.loaded,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleDone,
  };
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  if (isTomorrow) {
    return `Tomorrow ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date();
}
