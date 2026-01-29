import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  CreateTagRequest,
  Tag,
  TagFilters,
  TagPaginatedResponse,
  UpdateTagRequest,
} from "@/zustand/types/tag";

export const tagService = {
  async getAll(params: TagFilters = {}): Promise<TagPaginatedResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const { data } = await api.get<TagPaginatedResponse>(`/tags${queryString}`);
    return data;
  },

  async getById(id: string): Promise<Tag> {
    const { data } = await api.get<Tag>(`/tag/${id}`);
    return data;
  },

  async create(tagData: CreateTagRequest): Promise<Tag> {
    const { data } = await api.post<Tag>("/tag", tagData);
    return data;
  },

  async update(id: string, tagData: UpdateTagRequest): Promise<Tag> {
    const { data } = await api.put<Tag>(`/tag/${id}`, tagData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tag/${id}`);
  },
};
