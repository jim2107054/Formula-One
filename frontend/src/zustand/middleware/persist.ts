import { StateCreator } from "zustand";

export function persist<T>(
  config: StateCreator<T, [], [], T>,
  options: {
    name: string;
    partialize?: (state: T) => Partial<T>;
  }
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    // Create initial store first
    const store = config(
      (args) => {
        set(args);
        if (typeof window !== "undefined") {
          try {
            const state = get();
            const stateToPersist = options.partialize
              ? options.partialize(state)
              : state;

            localStorage.setItem(options.name, JSON.stringify(stateToPersist));
          } catch {
            console.warn(`Failed to persist state for ${options.name}`);
          }
        }
      },
      get,
      api
    );

    // Load persisted state and merge with current state
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(options.name);
      if (storedValue) {
        try {
          const storedState = JSON.parse(storedValue);
          // Merge stored state with current state
          set((currentState) => ({
            ...currentState,
            ...storedState,
          }));
        } catch {
          console.warn(`Failed to load persisted state for ${options.name}`);
        }
      }
    }

    return store;
  };
}
