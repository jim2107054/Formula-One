"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/zustand/stores/ui";

export const useRouteTracking = () => {
  const pathname = usePathname();
  const clearAll = useUIStore((state) => state.clearAllLastInteractedItems);
  const prevPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    // Only clear interaction history when leaving admin section entirely
    if (prevPathname.startsWith("/admin") && !pathname.startsWith("/admin")) {
      clearAll();
    }

    // Keep interaction history intact when switching between admin routes
    // This allows users to see which item they clicked when returning to a route

    prevPathnameRef.current = pathname;
  }, [pathname, clearAll]);
};
