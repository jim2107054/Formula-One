import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  Category,
  CategoryAPIResponse,
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/zustand/types/category";
import type { PaginatedResponse } from "@/zustand/types/pagination";

export const categoryService = {
  async getAll(
    params: Partial<CategoryFilters> = {}
  ): Promise<PaginatedResponse<Category>> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const { data } = await api.get<PaginatedResponse<Category>>(
      `/categories${queryString}`
    );
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get<CategoryAPIResponse<Category>>(
      `/category/${id}`
    );
    return data.data;
  },

  async create(categoryData: CreateCategoryRequest): Promise<Category> {
    const { data } = await api.post<CategoryAPIResponse<Category>>(
      "/category",
      categoryData
    );
    return data.data;
  },

  async update(
    id: string,
    categoryData: UpdateCategoryRequest
  ): Promise<Category> {
    const { data } = await api.put<CategoryAPIResponse<Category>>(
      `/category/${id}`,
      categoryData
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/category/${id}`);
  },
};
