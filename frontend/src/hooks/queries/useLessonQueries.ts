"use client";

import { lessonService } from "@/services/lesson.service";
import type {
  CreateLessonRequest,
  Lesson,
  LessonFilters,
  LessonWithItems,
  UpdateLessonRequest,
} from "@/zustand/types/lesson";
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

const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (filters: Partial<LessonFilters>) =>
    [...lessonKeys.lists(), filters] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  withItems: (id: string) => [...lessonKeys.detail(id), "items"] as const,
};

export function useLessons(
  filters?: Partial<LessonFilters>,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Lesson>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: lessonKeys.list(filters || {}),
    queryFn: () => lessonService.getAll(filters || {}),
    ...options,
  });
}

export function useLessonsInfinite(
  params?: Partial<LessonFilters>,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Lesson>,
      Error,
      InfiniteData<PaginatedResponse<Lesson>>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
  >
) {
  return useInfiniteQuery<
    PaginatedResponse<Lesson>,
    Error,
    InfiniteData<PaginatedResponse<Lesson>>
  >({
    queryKey: ["lessons", "infinite", params],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      lessonService.getAll({
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

export function useLesson(
  id: string,
  options?: Omit<UseQueryOptions<Lesson>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => lessonService.getById(id),
    enabled: !!id,
    ...options,
  });
}
export function useLessonWithItems(
  id: string,
  options?: Omit<UseQueryOptions<LessonWithItems>, "queryKey" | "queryFn">
) {
  return useQuery<LessonWithItems>({
    queryKey: lessonKeys.withItems(id),
    queryFn: () => lessonService.getWithItems(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateLesson(
  options?: UseMutationOptions<Lesson, Error, CreateLessonRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateLessonRequest) => lessonService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      toast.success("Lesson created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create lesson";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateLesson(
  options?: UseMutationOptions<
    Lesson,
    Error,
    { id: string; data: UpdateLessonRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: UpdateLessonRequest }) =>
      lessonService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(lessonKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      toast.success("Lesson updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update lesson";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteLesson(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => lessonService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: lessonKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      toast.success("Lesson deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete lesson";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
