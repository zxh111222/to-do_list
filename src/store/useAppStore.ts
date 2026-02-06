import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  dueDate?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'todo' | 'event';
}

export interface Note {
  id: string;
  content: string;
  color: string; // Tailwind class like 'bg-yellow-200' or hex
  createdAt: number;
}

interface AppState {
  todos: Todo[];
  events: CalendarEvent[];
  notes: Note[];
  
  // Settings
  opacity: number;
  setOpacity: (opacity: number) => void;
  
  weatherCity: string;
  setWeatherCity: (city: string) => void;

  addTodo: (text: string, dueDate?: Date) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  convertTodoToEvent: (todoId: string, date: Date) => void;

  addNote: (content: string, color?: string) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;

  // Data Management
  exportData: () => void;
  importData: (data: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todos: [
        { id: '1', text: 'Review project requirements', done: true },
        { id: '2', text: 'Design system architecture', done: false },
        { id: '3', text: 'Implement glassmorphism UI', done: false },
      ],
      events: [],
      notes: [
        { id: '1', content: 'Meeting notes: Discuss API integration', color: 'bg-yellow-200/80', createdAt: Date.now() }
      ],
      opacity: 0.6,
      weatherCity: '厦门市',

      setOpacity: (opacity) => set(() => ({ opacity })),
      setWeatherCity: (city) => set(() => ({ weatherCity: city })),

      addTodo: (text, dueDate) => set((state) => {
        const newTodo = { id: Date.now().toString(), text, done: false, dueDate };
        
        const newEvents = [...state.events];
        if (dueDate) {
             newEvents.push({
                 id: `evt-${Date.now()}`,
                 title: text,
                 date: dueDate,
                 type: 'todo'
             });
        }

        return {
            todos: [...state.todos, newTodo],
            events: newEvents
        };
      }),

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) => t.id === id ? { ...t, done: !t.done } : t)
      })),

      removeTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id)
      })),

      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: Date.now().toString() }]
      })),

      convertTodoToEvent: (todoId, date) => set((state) => {
        const todo = state.todos.find((t) => t.id === todoId);
        if (!todo) return state;

        return {
          events: [...state.events, {
            id: Date.now().toString(),
            title: todo.text,
            date: date,
            type: 'todo'
          }],
          todos: state.todos.map(t => t.id === todoId ? { ...t, dueDate: date } : t)
        };
      }),

      addNote: (content, color = 'bg-yellow-200/80') => set((state) => ({
        notes: [...state.notes, { id: Date.now().toString(), content, color, createdAt: Date.now() }]
      })),

      updateNote: (id, content) => set((state) => ({
        notes: state.notes.map((n) => n.id === id ? { ...n, content } : n)
      })),

      removeNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),

      exportData: () => {
          const state = get();
          const data = {
              todos: state.todos,
              events: state.events,
              notes: state.notes,
              opacity: state.opacity,
              weatherCity: state.weatherCity,
              version: '1.0.0',
              timestamp: Date.now()
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `glassflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
      },

      importData: (data: any) => set((state) => ({
          todos: data.todos || state.todos,
          events: data.events || state.events,
          notes: data.notes || state.notes,
          opacity: data.opacity || state.opacity,
          weatherCity: data.weatherCity || state.weatherCity
      }))
    }),
    {
      name: 'glassflow-storage',
      partialize: (state) => ({ todos: state.todos, events: state.events, notes: state.notes, opacity: state.opacity, weatherCity: state.weatherCity }),
    }
  )
);
