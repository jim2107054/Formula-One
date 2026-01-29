"use client";

import { breadcrumbService } from "@/services/breadcrumb.service";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { BreadcrumbStore } from "@/zustand/types/breadcrumb";

type BreadcrumbData = BreadcrumbStore["breadcrumbData"];

const breadcrumbKeys = {
  all: ["breadcrumb"] as const,
  detail: (params: {
    courseId?: string;
    sectionId?: string;
    lessonId?: string;
    itemId?: string;
  }) => [...breadcrumbKeys.all, "detail", params] as const,
};

export function useBreadcrumb(
  params: {
    courseId?: string;
    sectionId?: string;
    lessonId?: string;
    itemId?: string;
  },
  options?: Omit<UseQueryOptions<BreadcrumbData>, "queryKey" | "queryFn">
) {
  const { courseId = "", sectionId = "", lessonId = "", itemId = "" } = params;

  const enabled =
    Boolean(courseId) ||
    Boolean(sectionId) ||
    Boolean(lessonId) ||
    Boolean(itemId);

  return useQuery<BreadcrumbData>({
    queryKey: breadcrumbKeys.detail(params),
    queryFn: () =>
      breadcrumbService.getBreadcrumb(courseId, sectionId, lessonId, itemId),
    enabled,
    ...options,
  });
}
