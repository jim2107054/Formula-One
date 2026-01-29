import { PaginatedResponse } from "./pagination";

export type CategoryStatus = "draft" | "published";

export interface Category {
  _id: string;
  title: string;
  desc: string;
  status: CategoryStatus;
  is_published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  title: string;
  desc: string;
  is_published: boolean;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CategoryFilters {
  search?: string;
  courseId?: string;
  is_published?: boolean;
  sortBy?: "createdAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CategoryAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CategoryListResponse {
  meta: {
    previous: number | null;
    next: number | null;
    total: number;
    page_size: number;
  };
  entries: Category[];
}

export type CategoryPaginatedResponse = PaginatedResponse<Category>;
