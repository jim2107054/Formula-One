"use client";

import { sectionService } from "@/services/section.service";
import type {
  CreateSectionRequest,
  Section,
  SectionFilters,
  UpdateSectionRequest,
} from "@/zustand/types/section";
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

interface SectionPaginatedResponse {
  success: boolean;
  data: Section[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

const sectionKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionKeys.all, "list"] as const,
  list: (filters: Partial<SectionFilters>) =>
    [...sectionKeys.lists(), filters] as const,
  details: () => [...sectionKeys.all, "detail"] as const,
  detail: (id: string) => [...sectionKeys.details(), id] as const,
};

export function useSections(
  filters?: Partial<SectionFilters>,
  options?: Omit<
    UseQueryOptions<SectionPaginatedResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: sectionKeys.list(filters || {}),
    queryFn: () => sectionService.getAll(filters || {}),
    ...options,
  });
}

export function useSectionsInfinite(
  params?: Partial<SectionFilters>,
  options?: Omit<
    UseInfiniteQueryOptions<
      SectionPaginatedResponse,
      Error,
      InfiniteData<SectionPaginatedResponse>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
  >
) {
  return useInfiniteQuery<
    SectionPaginatedResponse,
    Error,
    InfiniteData<SectionPaginatedResponse>
  >({
    queryKey: ["sections", "infinite", params],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      sectionService.getAll({
        ...params,
        page: pageParam as number,
      }),

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,

    ...options,
  });
}

export function useSection(
  id: string,
  options?: Omit<UseQueryOptions<Section>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sectionKeys.detail(id),
    queryFn: () => sectionService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useSectionWithLessons(
  id: string,
  options?: Omit<UseQueryOptions<Section>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sectionKeys.detail(id),
    queryFn: () => sectionService.getSectionWithLessons(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateSection(
  options?: UseMutationOptions<
    Section,
    Error,
    { courseId: string; data: Omit<CreateSectionRequest, "courseId"> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: Omit<CreateSectionRequest, "courseId">;
    }) => sectionService.create(courseId, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast.success("Section created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create section";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateSection(
  options?: UseMutationOptions<
    Section,
    Error,
    { id: string; data: UpdateSectionRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: UpdateSectionRequest }) =>
      sectionService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(sectionKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast.success("Section updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update section";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteSection(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => sectionService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: sectionKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      toast.success("Section deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete section";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
