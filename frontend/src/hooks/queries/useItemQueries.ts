"use client";

import { itemService } from "@/services/item.service";
import type {
  CreateItemRequest,
  EnrolledItem,
  Item,
  ItemFilters,
  UpdateItemRequest,
} from "@/zustand/types/item";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Query Keys
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (filters: Partial<ItemFilters>) =>
    [...itemKeys.lists(), filters] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

/**
 * Hook to fetch all items with filters
 */
export function useItems(
  filters: Partial<ItemFilters> = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Item>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<PaginatedResponse<Item>, Error>({
    queryKey: itemKeys.list(filters),
    queryFn: () => itemService.getAll(filters),
    ...options,
  });
}

/**
 * Hook to fetch all items of the courses the user is enrolled in
 */

export function useItemsOfEnrolledCourses(
  options?: Omit<UseQueryOptions<EnrolledItem[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<EnrolledItem[], Error>({
    queryKey: itemKeys.all,
    queryFn: () => itemService.getAllItemsOfEnrolledCourses(),
    ...options,
  });
}

/**
 * Hook to fetch a single item by ID
 */
export function useItem(
  id: string,
  options?: Omit<UseQueryOptions<Item, Error>, "queryKey" | "queryFn">
) {
  return useQuery<Item, Error>({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemService.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new item
 */
export function useCreateItem(
  options?: Omit<
    UseMutationOptions<Item, Error, CreateItemRequest>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemRequest>({
    ...options,
    mutationFn: (itemData) => itemService.create(itemData),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item created successfully");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create item";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

/**
 * Hook to update an existing item
 */
export function useUpdateItem(
  options?: Omit<
    UseMutationOptions<Item, Error, { id: string; data: UpdateItemRequest }>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, { id: string; data: UpdateItemRequest }>({
    ...options,
    mutationFn: ({ id, data }) => itemService.update(id, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(variables.id),
      });
      toast.success("Item updated successfully");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update item";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

/**
 * Hook to update item completion status (mark done) by ID only
 */
export function useUpdateItemStatus(
  options?: Omit<UseMutationOptions<Item, Error, string>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, string>({
    mutationFn: (id) => itemService.updateItemStatus(id),
    onSuccess: (_item, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      toast.success("Item status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update item status");
    },
    ...options,
  });
}

/**
 * Hook to delete an item
 */
export function useDeleteItem(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => itemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Item deleted successfully");
    },
    onError: (error) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete item";
      toast.error(errorMessage);
    },
    ...options,
  });
}

/**
 * Hook to reorder items within a lesson
 */
export function useReorderItems(
  options?: Omit<
    UseMutationOptions<
      Item[],
      Error,
      { lessonId: string; itemOrders: { itemId: string; order: number }[] }
    >,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    Item[],
    Error,
    { lessonId: string; itemOrders: { itemId: string; order: number }[] }
  >({
    mutationFn: ({ lessonId, itemOrders }) =>
      itemService.reorder(lessonId, itemOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      toast.success("Items reordered successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder items");
    },
    ...options,
  });
}
