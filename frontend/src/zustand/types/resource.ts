export interface Resource {
  id: string;
  is_extra?: boolean;
  is_hidden?: boolean;
  creator: string;
  module: string;
  title?: string;
  desc?: string;
  url?: string;
  upload_result?: unknown;
  kind?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  is_extra?: boolean;
  is_hidden?: boolean;
  creator: string;
  module: string;
  title?: string;
  desc?: string;
  url?: string;
  upload_result?: unknown;
  kind?: string;
}

export type UpdateResourceRequest = Partial<CreateResourceRequest>;

export interface ResourceFilters {
  creator?: string;
  module?: string;
  is_extra?: boolean;
  is_hidden?: boolean;
  search?: string;
  sortBy?: "createdAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ResourceAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
