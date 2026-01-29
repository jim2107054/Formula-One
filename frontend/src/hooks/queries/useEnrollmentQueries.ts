"use client";

import { queryKeys } from "@/lib/query-keys";
import { enrollmentService } from "@/services/enrollment.service";
import type {
  AllEnrolledrollmentData,
  CreateEnrollRequest,
  Enroll,
  EnrollFilters,
  UpdateEnrollRequest,
} from "@/zustand/types/enroll";
import type { PaginatedResponse } from "@/zustand/types/pagination";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useEnrollments(
  filters?: Partial<EnrollFilters>,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Enroll>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.enrollments.list(filters || {}),
    queryFn: () => enrollmentService.getAll(filters || {}),
    ...options,
  });
}

export function useAllEnrollmentData(
  title: string,
  options?: Omit<
    UseQueryOptions<AllEnrolledrollmentData[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["enrollments", "allEnrollmentData", title],
    queryFn: () => enrollmentService.getAllEnrollmentData(title),
    ...options,
  });
}
export function useEnrollment(
  id: string,
  options?: Omit<UseQueryOptions<Enroll>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: () => enrollmentService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateEnrollment(
  options?: UseMutationOptions<Enroll, Error, CreateEnrollRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateEnrollRequest) => enrollmentService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.lists(),
      });
      toast.success("Enrollment created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create enrollment";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateEnrollment(
  options?: UseMutationOptions<
    Enroll,
    Error,
    { id: string; data: UpdateEnrollRequest | FormData }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEnrollRequest | FormData;
    }) => enrollmentService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(
        queryKeys.enrollments.detail(variables.id),
        data
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.lists(),
      });
      toast.success("Enrollment updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update enrollment";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteEnrollment(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => enrollmentService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({
        queryKey: queryKeys.enrollments.detail(variables),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.lists(),
      });
      toast.success("Enrollment deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete enrollment";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
