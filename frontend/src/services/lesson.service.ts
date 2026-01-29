import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type { CourseAPIResponse } from "@/zustand/types/course";
import type {
  CreateLessonRequest,
  Lesson,
  LessonFilters,
  LessonWithItems,
  UpdateLessonRequest,
} from "@/zustand/types/lesson";
import type { PaginatedResponse } from "@/zustand/types/pagination";

export const lessonService = {
  async getAll(
    filters: Partial<LessonFilters> = {}
  ): Promise<PaginatedResponse<Lesson>> {
    const queryString = buildQueryString(
      filters as Record<string, unknown>
    );
    const { data } = await api.get<PaginatedResponse<Lesson>>(
      `/lessons${queryString}`
    );
    return data;
  },

  async getById(id: string): Promise<Lesson> {
    const { data } = await api.get<CourseAPIResponse<Lesson>>(`/lesson/${id}`);
    return data.data;
  },

  async getWithItems(id: string): Promise<LessonWithItems> {
    const { data } = await api.get<CourseAPIResponse<LessonWithItems>>(
      `/lesson/${id}/items`
    );
    return data.data;
  },

  async create(lessonData: CreateLessonRequest): Promise<Lesson> {
    const { data } = await api.post<CourseAPIResponse<Lesson>>(
      "/lesson",
      lessonData
    );
    return data.data;
  },

  async update(id: string, lessonData: UpdateLessonRequest): Promise<Lesson> {
    const { data } = await api.put<CourseAPIResponse<Lesson>>(
      `/lesson/${id}`,
      lessonData
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/lesson/${id}`);
  },
};
