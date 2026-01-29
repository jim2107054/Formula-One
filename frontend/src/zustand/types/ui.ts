export type AdminRoute =
  | "/admin/user"
  | "/admin/course"
  | "/admin/section"
  | "/admin/lesson"
  | "/admin/item"
  | "/admin/enrollment"
  | "/admin/tag"
  | "/admin/category";

export interface UIStore {
  lastInteractedItems: Partial<Record<AdminRoute, string>>;
  sidebarCollapsed: boolean;
  setLastInteractedItem: (route: AdminRoute, itemId: string) => void;
  clearLastInteractedItem: (route: AdminRoute) => void;
  clearAllLastInteractedItems: () => void;
  toggleSidebar: () => void;
}
