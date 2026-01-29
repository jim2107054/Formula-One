"use client";

import { queryKeys } from "@/lib/query-keys";
import { courseService } from "@/services/course.service";
import type {
  Course,
  CourseFilters,
  CourseWithSections,
  CreateCourseRequest,
  PaginatedResponse,
  UpdateCourseRequest,
} from "@/zustand/types/course";
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

export function useCourses(
  filters?: Partial<CourseFilters>,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Course>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters || {}),
    queryFn: () => courseService.getAll(filters || {}),
    ...options,
  });
}

export function useCoursesInfinite(
  params?: Partial<CourseFilters>,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Course>,
      Error,
      InfiniteData<PaginatedResponse<Course>>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
  >
) {
  return useInfiniteQuery<
    PaginatedResponse<Course>,
    Error,
    InfiniteData<PaginatedResponse<Course>>
  >({
    queryKey: ["courses", "infinite", params],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      courseService.getAll({
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

export function useCourse(
  id: string,
  options?: Omit<UseQueryOptions<Course>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCourseBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Course>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.courses.bySlug(slug),
    queryFn: () => courseService.getBySlug(slug),
    enabled: !!slug,
    ...options,
  });
}

export function useCourseWithSections(
  id: string,
  options?: Omit<UseQueryOptions<CourseWithSections>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.courses.withSections(id),
    queryFn: () => courseService.getWithSections(id),
    enabled: !!id,
    ...options,
  });
}

export function useDeepCopyCourse(
  options?: UseMutationOptions<Course, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, string, unknown>({
    mutationFn: courseService.deepCopy,

    onSuccess: (newCourse, courseId, _, __) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module copied successfully!");
      options?.onSuccess?.(newCourse, courseId, _, __);
    },

    onError: (error, courseId, _, __) => {
      toast.error(error.message || "Failed to copy module");
      options?.onError?.(error, courseId, _, __);
    },

    ...options,
  });
}

export function useCreateCourse(
  options?: UseMutationOptions<Course, Error, CreateCourseRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateCourseRequest) => courseService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      toast.success("Module created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create course";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCourse(
  options?: UseMutationOptions<
    Course,
    Error,
    { id: string; data: UpdateCourseRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) =>
      courseService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(queryKeys.courses.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      toast.success("Module updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update module";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteCourse(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => courseService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({
        queryKey: queryKeys.courses.detail(variables),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      toast.success("Module deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete course";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function usePrefetchCourse() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(id),
      queryFn: () => courseService.getById(id),
    });
  };
}
