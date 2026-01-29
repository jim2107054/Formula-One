export interface Discussion {
  id: string;
  user: string;
  body: string;
  replies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscussionRequest {
  user: string;
  body: string;
  replies?: string[];
}

export type UpdateDiscussionRequest = Partial<CreateDiscussionRequest>;

export interface DiscussionFilters {
  user?: string;
  search?: string;
  sortBy?: "createdAt" | "body";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DiscussionAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
