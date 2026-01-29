"use client";

import { categoryService } from "@/services/category.service";
import type {
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/zustand/types/category";
import type { PaginatedResponse } from "@/zustand/types/pagination";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: Partial<CategoryFilters>) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(
  filters?: Partial<CategoryFilters>,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Category>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: categoryKeys.list(filters || {}),
    queryFn: () => categoryService.getAll(filters || {}),
    ...options,
  });
}

export function useCategoriesInfinite(
  filters?: Partial<CategoryFilters>,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Category>,
      Error,
      InfiniteData<PaginatedResponse<Category>>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >
) {
  return useInfiniteQuery({
    queryKey: ["categories", "infinite", filters],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      categoryService.getAll({
        ...filters,
        page: pageParam as number,
      }),

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,

    ...options,
  });
}

export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<Category>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, CreateCategoryRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create category";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCategory(
  options?: UseMutationOptions<
    Category,
    Error,
    { id: string; data: UpdateCategoryRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update category";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteCategory(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => categoryService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete category";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
