import { useUIStore } from "@/zustand/stores/ui";
import type { AdminRoute } from "@/zustand/types/ui";
import { useCallback } from "react";

export const useTableInteraction = (route: AdminRoute) => {
  const setLastInteractedItem = useUIStore(
    (state) => state.setLastInteractedItem
  );

  // Properly select the last interacted item for this route with reactivity
  const lastInteractedId = useUIStore(
    (state) => state.lastInteractedItems[route]
  );

  const handleInteraction = useCallback(
    (itemId: string) => setLastInteractedItem(route, itemId),
    [route, setLastInteractedItem]
  );

  const isLastInteracted = useCallback(
    (itemId: string) => lastInteractedId === itemId,
    [lastInteractedId]
  );

  return { handleInteraction, isLastInteracted };
};
