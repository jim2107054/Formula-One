"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  const setParams = (
    updates: Record<string, string | number | null | undefined>
  ) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const resetParams = (defaults: Record<string, string | number> = {}) => {
    const newParams = new URLSearchParams();
    Object.entries(defaults).forEach(([key, value]) => {
      newParams.set(key, String(value));
    });
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return { params, setParams, resetParams };
}
