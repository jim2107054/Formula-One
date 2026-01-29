"use client";

import { useUrlState } from "./useUrlState";

export type PageSize = 10 | 20 | 50 | 100;

interface PaginationOptions {
  defaultPageSize?: PageSize;
}

export function usePagination({
  defaultPageSize = 10,
}: PaginationOptions = {}) {
  const { params, setParams, resetParams } = useUrlState();

  const setFilters = (filters: Record<string, unknown>) => {
    setParams({ ...filters, page: 1 });
  };

  const setPage = (page: number) => {
    setParams({ page });
  };

  const setPageSize = (limit: PageSize) => {
    setParams({ page: 1, limit });
  };

  const resetFilters = () => {
    resetParams({ page: 1, limit: defaultPageSize });
  };

  return {
    params,
    setFilters,
    setPage,
    setPageSize,
    resetFilters,
  };
}
