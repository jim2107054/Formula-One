export interface Upload {
  _id: string;
  is_extra?: boolean;
  is_hidden?: boolean;
  creator?: string;
  module?: string;
  discussion?: string[];
  title?: string;
  desc?: string;
  duration?: number;
  url?: string;
  extension?: string;
  kind?: string;
  upload_result?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUploadRequest {
  is_extra?: boolean;
  is_hidden?: boolean;
  creator: string;
  module: string;
  discussions?: string[];
  title?: string;
  desc?: string;
  duration?: number;
  url?: string;
  extension?: string;
  kind?: string;
  upload_result?: unknown;
}

export type UpdateUploadRequest = Partial<CreateUploadRequest>;

export interface UploadFilters {
  creator?: string;
  module?: string;
  is_extra?: boolean;
  is_hidden?: boolean;
  extension?: string;
  kind?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "duration";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UploadAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface UploadStore {
  uploads: Upload[];
  currentUpload: Upload | null;
  loading: {
    uploads: boolean;
    upload: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: {
    uploads: string | null;
    upload: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: UploadFilters;
  lastFetched: {
    uploads: number | null;
    upload: number | null;
  };
}
