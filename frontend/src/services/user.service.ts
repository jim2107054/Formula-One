import api from "@/util/api";
import { buildQueryString } from "@/util/buildQueryString";
import type {
  CreateUserData,
  ListUsersParams,
  UpdateUserData,
  User,
  UserAPIResponse,
  UserPaginatedResponse,
} from "@/zustand/types/user";

export const userService = {
  async getAll(params: ListUsersParams = {}): Promise<UserPaginatedResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const { data } = await api.get<UserPaginatedResponse>(
      `/users${queryString}`
    );
    return data;
  },

  async getById(id: string): Promise<UserAPIResponse> {
    const res = await api.get<UserAPIResponse>(`/user/${id}`);
    return res.data;
  },

  async getPassword(id: string): Promise<{ id: string; password: string }> {
    const { data } = await api.get<{ id: string; password: string }>(
      `/user/password/${id}`
    );
    return data;
  },

  async create(userData: CreateUserData): Promise<User> {
    const { data } = await api.post<User>("/user", userData);
    return data;
  },

  async update(id: string, userData: UpdateUserData | FormData): Promise<User> {
    // If already FormData, send as multipart
    if (typeof FormData !== "undefined" && userData instanceof FormData) {
      const { data } = await api.put<User>(`/user/${id}`, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    // If contains a file, transform to FormData
    const hasFile = (userData as UpdateUserData)?.profile instanceof File;
    if (hasFile) {
      const fd = new FormData();
      Object.entries(userData as UpdateUserData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "profile" && value instanceof File) {
          fd.append("profile", value);
        } else {
          fd.append(key, String(value));
        }
      });
      const { data } = await api.put<User>(`/user/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    // Fallback to JSON
    const { data } = await api.put<User>(`/user/${id}`, userData as UpdateUserData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },
};
