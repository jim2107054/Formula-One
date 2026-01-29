"use client";

import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  CreateItemRequest,
  EnrolledItem,
  Item,
  ItemFilters,
  UpdateItemRequest,
} from "@/zustand/types/item";

interface ItemAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const itemService = {
  /**
   * Fetch all items with filters
   */
  async getAll(
    params: Partial<ItemFilters> = {}
  ): Promise<PaginatedResponse<Item>> {
    // const adminFilters = {
    //   page: params.page,
    //   limit: params.limit,
    //   search: params.search,
    //   lessonId: params.lessonId,
    //   sectionId: params.sectionId,
    //   courseId: params.courseId,
    //   type: params.type,
    //   status: params.status,
    //   sortBy: params.sortBy,
    // };
    const queryString = buildQueryString(
      params as Record<string, unknown>
    );
    const response = await api.get<PaginatedResponse<Item>>(
      `/items${queryString}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Item> {
    const response = await api.get<ItemAPIResponse<Item>>(`/item/${id}`);
    if (!response.data.data) {
      throw new Error("Item not found");
    }
    return response.data.data;
  },

  async getAllItemsOfEnrolledCourses(): Promise<EnrolledItem[]> {
    const response = await api.get<ItemAPIResponse<EnrolledItem[]>>(
      `/items/get-all-items-search`
    );
    return response.data.data;
  },

  async updateItemStatus(itemId: string): Promise<Item> {
    const response = await api.put(`/item/${itemId}/mark-done`);

    return response.data.data;
  },

  async create(itemData: CreateItemRequest): Promise<Item> {
    const config =
      itemData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined;

    const response = await api.post<ItemAPIResponse<Item>>(
      "/item",
      itemData,
      config
    );
    return response.data.data;
  },

  async update(id: string, itemData: UpdateItemRequest): Promise<Item> {
    const config =
      itemData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined;

    const response = await api.put<ItemAPIResponse<Item>>(
      `/item/${id}`,
      itemData,
      config
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/item/${id}`);
  },

  async reorder(
    lessonId: string,
    itemOrders: { itemId: string; order: number }[]
  ): Promise<Item[]> {
    const response = await api.put<ItemAPIResponse<Item[]>>("/items/reorder", {
      lessonId,
      itemOrders,
    });
    return response.data.data;
  },
};
