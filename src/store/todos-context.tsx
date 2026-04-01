import React, { createContext, useContext } from 'react';
import { useTodos, Todo } from '@/store/todos';

interface TodosContextValue {
  todos: Todo[];
  todayTodos: Todo[];
  loaded: boolean;
  addTodo: (data: Omit<Todo, 'id' | 'createdAt' | 'done'>) => Todo;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  deleteTodo: (id: string) => void;
  toggleDone: (id: string) => void;
}

const TodosContext = createContext<TodosContextValue | null>(null);

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const store = useTodos();
  return <TodosContext.Provider value={store}>{children}</TodosContext.Provider>;
}

export function useTodosContext(): TodosContextValue {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodosContext must be inside TodosProvider');
  return ctx;
}
