"use client";

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

import type {
  CreateUserData,
  ListUsersParams,
  UpdateUserData,
  User,
  UserAPIResponse,
  UserPaginatedResponse,
} from "@/zustand/types/user";
import { userService } from "@/services/user.service";

const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  password: (id: string) => [...userKeys.detail(id), "password"] as const,
};

export function useUsers(
  params?: ListUsersParams,
  options?: Omit<UseQueryOptions<UserPaginatedResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => userService.getAll(params || {}),
    ...options,
  });
}

export function useUsersInfinite(
  params?: ListUsersParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      UserPaginatedResponse,
      Error,
      InfiniteData<UserPaginatedResponse>,
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
  >
) {
  return useInfiniteQuery<
    UserPaginatedResponse,
    Error,
    InfiniteData<UserPaginatedResponse>
  >({
    queryKey: ["users", "infinite", params],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      userService.getAll({
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

export function useUser(
  id: string,
  options?: Omit<UseQueryOptions<UserAPIResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useUserPassword(
  id: string,
  options?: Omit<
    UseQueryOptions<{ id: string; password: string }>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: userKeys.password(id),
    queryFn: () => userService.getPassword(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateUser(
  options?: UseMutationOptions<User, Error, CreateUserData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data: CreateUserData) => userService.create(data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User created successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to create user";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateUser(
  options?: UseMutationOptions<
    User,
    Error,
    { id: string; data: UpdateUserData | FormData }
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
      data: UpdateUserData | FormData;
    }) => userService.update(id, data),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to update user";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => userService.delete(id),

    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User deleted successfully!");
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        error.message ||
        "Failed to delete user";
      toast.error(errorMessage);
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}
