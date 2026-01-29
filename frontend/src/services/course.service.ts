import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  Course,
  CourseAPIResponse,
  CourseFilters,
  CourseStats,
  CourseWithSections,
  CreateCourseRequest,
  PaginatedResponse,
  UpdateCourseRequest,
} from "@/zustand/types/course";

export const courseService = {
  async getAll(
    params: Partial<CourseFilters> = {}
  ): Promise<PaginatedResponse<Course>> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const { data } = await api.get<PaginatedResponse<Course>>(
      `/courses${queryString}`
    );
    return data;
  },

  async getById(id: string): Promise<Course> {
    const { data } = await api.get<CourseAPIResponse<Course>>(`/course/${id}`);
    return data.data;
  },

  async getBySlug(slug: string): Promise<Course> {
    const { data } = await api.get<CourseAPIResponse<Course>>(
      `/course/slug/${slug}`
    );
    return data.data;
  },

  async getWithSections(id: string): Promise<CourseWithSections> {
    const { data } = await api.get<CourseAPIResponse<CourseWithSections>>(
      `/course/${id}/sections`
    );
    return data.data;
  },

  async deepCopy(id: string): Promise<Course> {
    const { data } = await api.get<CourseAPIResponse<Course>>(
      `/course/${id}/deep-copy`
    );
    return data.data;
  },

  async create(courseData: CreateCourseRequest): Promise<Course> {
    const { data } = await api.post<CourseAPIResponse<Course>>(
      "/course",
      courseData
    );
    return data.data;
  },

  async update(id: string, courseData: UpdateCourseRequest): Promise<Course> {
    const { data } = await api.put<CourseAPIResponse<Course>>(
      `/course/${id}`,
      courseData
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/course/${id}`);
  },

  async getStats(id: string): Promise<CourseStats> {
    const { data } = await api.get<CourseAPIResponse<CourseStats>>(
      `/course/${id}/stats`
    );
    return data.data;
  },
};
