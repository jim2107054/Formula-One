export interface Tag {
  _id: string;
  title: string;
  desc: string;
  is_published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  title: string;
  desc: string;
  is_published: boolean;
}

export type UpdateTagRequest = Partial<CreateTagRequest>;

export interface TagFilters {
  is_published?: boolean;
  search?: string;
  sortBy?: "createdAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TagAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface TagListResponse {
  meta: {
    previous: number | null;
    next: number | null;
    total: number;
    page_size: number;
  };
  entries: Tag[];
}

export type TagPaginatedResponse =
  import("./pagination").PaginatedResponse<Tag>;
