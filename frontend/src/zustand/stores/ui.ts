import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UIStore, AdminRoute } from "@/zustand/types/ui";

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      lastInteractedItems: {},
      sidebarCollapsed: true,

      setLastInteractedItem: (route: AdminRoute, itemId: string) =>
        set((state) => ({
          lastInteractedItems: {
            ...state.lastInteractedItems,
            [route]: itemId,
          },
        })),

      clearLastInteractedItem: (route: AdminRoute) =>
        set((state) => {
          const items = { ...state.lastInteractedItems };
          delete items[route];
          return { lastInteractedItems: items };
        }),

      clearAllLastInteractedItems: () => set({ lastInteractedItems: {} }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        lastInteractedItems: state.lastInteractedItems,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          try {
            const value = sessionStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Handle storage errors silently
          }
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          try {
            sessionStorage.removeItem(name);
          } catch {
            // Handle storage errors silently
          }
        },
      },
    }
  )
);
