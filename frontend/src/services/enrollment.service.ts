import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  AllEnrolledrollmentData,
  CreateEnrollRequest,
  Enroll,
  EnrollAPIResponse,
  EnrollFilters,
  UpdateEnrollRequest,
} from "@/zustand/types/enroll";
import type { PaginatedResponse } from "@/zustand/types/pagination";

export const enrollmentService = {
  async getAll(
    params: Partial<EnrollFilters> = {}
  ): Promise<PaginatedResponse<Enroll>> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const { data } = await api.get<EnrollAPIResponse<Enroll[]>>(
      `/enrolls${queryString}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
      success: data.success,
    };
  },

  async getAllEnrollmentData(
    title: string
  ): Promise<AllEnrolledrollmentData[]> {
    const { data } = await api.get<
      EnrollAPIResponse<AllEnrolledrollmentData[]>
    >(`/enrolls/search?search=${title}`);
    return data.data;
  },

  async getById(id: string): Promise<Enroll> {
    const { data } = await api.get<EnrollAPIResponse<Enroll>>(`/enroll/${id}`);
    return data.data;
  },

  async create(enrollData: CreateEnrollRequest): Promise<Enroll> {
    try {
      const { data } = await api.post<Enroll>("/enroll", enrollData);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        throw error;
      }
      throw new Error("Failed to create enrollment");
    }
  },

  async update(
    id: string,
    enrollData: UpdateEnrollRequest | FormData
  ): Promise<Enroll> {
    const config =
      enrollData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
    const { data } = await api.patch<Enroll>(
      `/enroll/${id}`,
      enrollData,
      config
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/enroll/${id}`);
  },
};
