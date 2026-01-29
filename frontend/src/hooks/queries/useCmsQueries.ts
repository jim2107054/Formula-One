"use client";

import { FAQ } from "@/app/(protected)/student/student-dashboard/faq/page";
import cmsService from "@/services/cms.service";
import { Cms, CreateCmsRequest, UpdateCmsRequest } from "@/zustand/types/cms";
import { UpcomingModule } from "@/zustand/types/upcomingModules";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

type CmsKeyMap = {
  faq: FAQ[];
  "upcoming-module": UpcomingModule[];
  "useful-link": { title: string; bookingUrl: string }[];
};

type CmsKey = keyof CmsKeyMap;

export const cmsKeys = {
  all: ["cms"] as const,
  lists: () => [...cmsKeys.all, "list"] as const,
  list: (filters?: unknown) => [...cmsKeys.lists(), filters] as const,
  details: () => [...cmsKeys.all, "detail"] as const,
  detail: (key: string) => [...cmsKeys.details(), key] as const,
  detailById: (id: string) => [...cmsKeys.all, "id", id] as const,
};

/**
 * Hook to fetch CMS content by key with type safety
 */
export function useCmsByKey<K extends CmsKey>(
  key: K,
  options?: Omit<UseQueryOptions<CmsKeyMap[K], Error>, "queryKey" | "queryFn">
) {
  return useQuery<CmsKeyMap[K], Error>({
    queryKey: cmsKeys.detail(key),
    queryFn: () => cmsService.getCmsContentByKey(key),
    enabled: !!key,
    ...options,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

/**
 * Hook to fetch all CMS entries with pagination
 */
export function useAllCms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  is_public?: boolean;
}) {
  return useQuery({
    queryKey: cmsKeys.list(params),
    queryFn: () => cmsService.getAllCms(params),
  });
}

/**
 * Hook to fetch single CMS by ID
 */
export function useCms(id: string) {
  return useQuery({
    queryKey: cmsKeys.detailById(id),
    queryFn: () => cmsService.getCmsById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create CMS
 */
export function useCreateCms(options?: {
  onSuccess?: (data: Cms) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCmsRequest) => cmsService.createCms(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.lists() });
      toast.success("CMS content created successfully");
      options?.onSuccess?.(response.data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create CMS content");
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to update CMS
 */
export function useUpdateCms(options?: {
  onSuccess?: (data: Cms) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCmsRequest }) =>
      cmsService.updateCms(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cmsKeys.detailById(variables.id),
      });
      toast.success("CMS content updated successfully");
      options?.onSuccess?.(response.data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update CMS content");
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to delete CMS
 */
export function useDeleteCms(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deleteCms(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.lists() });
      toast.success("CMS content deleted successfully");
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete CMS content");
      options?.onError?.(error);
    },
  });
}
