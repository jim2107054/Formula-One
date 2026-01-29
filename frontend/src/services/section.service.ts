import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  CreateSectionRequest,
  Section,
  SectionFilters,
  UpdateSectionRequest,
} from "@/zustand/types/section";

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

export const sectionService = {
  async getAll(
    params: Partial<SectionFilters> = {}
  ): Promise<SectionPaginatedResponse> {
    const queryString = buildQueryString(
      params as Record<string, unknown>
    );
    const { data } = await api.get<SectionPaginatedResponse>(
      `/sections${queryString}`
    );
    return data;
  },

  async getById(id: string): Promise<Section> {
    const { data } = await api.get<{ success: boolean; data: Section }>(
      `/section/${id}`
    );
    return data.data;
  },
  async getSectionWithLessons(id: string): Promise<Section> {
    const { data } = await api.get<{ success: boolean; data: Section }>(
      `/section/${id}/lessons`
    );
    return data.data;
  },

  async create(
    courseId: string,
    sectionData: Omit<CreateSectionRequest, "courseId">
  ): Promise<Section> {
    const payload = {
      ...sectionData,
      courseId,
    };
    const { data } = await api.post<{ success: boolean; data: Section }>(
      `/section`,
      payload
    );
    return data.data;
  },

  async update(
    id: string,
    sectionData: UpdateSectionRequest
  ): Promise<Section> {
    const { data } = await api.put<{ success: boolean; data: Section }>(
      `/section/${id}`,
      sectionData
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/section/${id}`);
  },
};
