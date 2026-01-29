"use client";

import { certificateService } from "@/services/certificate.service";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Certificate } from "@/zustand/types/certificate";

export const certificateKeys = {
  all: ["certificates"] as const,
  details: () => [...certificateKeys.all, "detail"] as const,
  detail: (enrollmentId: string) =>
    [...certificateKeys.details(), enrollmentId] as const,
};

/**
 * Hook to fetch certificate by enrollment ID
 */
export function useCertificate(
  enrollmentId: string,
  options?: Omit<UseQueryOptions<Certificate, Error>, "queryKey" | "queryFn">
) {
  return useQuery<Certificate, Error>({
    queryKey: certificateKeys.detail(enrollmentId),
    queryFn: () => certificateService.getByEnrollmentId(enrollmentId),
    enabled: !!enrollmentId,

    ...options,
  });
}
