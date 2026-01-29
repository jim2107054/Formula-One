"use client";

import { tagService } from "@/services/tag.service";
import type {
  CreateTagRequest,
  Tag,
  TagFilters,
  TagPaginatedResponse,
  UpdateTagRequest,
} from "@/zustand/types/tag";
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

const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (filters: TagFilters) => [...tagKeys.lists(), filters] as const,
  details: () => [...tagKeys.all, "detail"] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

export function useTags(
  filters?: TagFilters,
  options?: Omit<UseQueryOptions<TagPaginatedResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: tagKeys.list(filters || {}),
    queryFn: () => tagService.getAll(filters || {}),
    ...options,
  });
}

export function useTagsInfinite(
  filters?: TagFilters,
  options?: Omit<
    UseInfiniteQueryOptions<
      TagPaginatedResponse,
      Error,
      InfiniteData<TagPaginatedResponse>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >
) {
  return useInfiniteQuery<
    TagPaginatedResponse,
    Error,
    InfiniteData<TagPaginatedResponse>
  >({
    queryKey: ["tags", "infinite", filters],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      tagService.getAll({
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

export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<Tag>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTag(
  options?: UseMutationOptions<Tag, Error, CreateTagRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateTagRequest) => tagService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      toast.success("Tag created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      console.log(error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create tag";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateTag(
  options?: UseMutationOptions<
    Tag,
    Error,
    { id: string; data: UpdateTagRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      tagService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(tagKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      toast.success("Tag updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update tag";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteTag(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => tagService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: tagKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      toast.success("Tag deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete tag";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
