export interface History {
  kind?: string;
  item?: string;
  status?: string;
}

export interface Activity {
  id: string;
  enroll: string;
  history?: History[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  enroll: string;
  history?: History[];
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export interface ActivityFilters {
  enroll?: string;
  search?: string;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ActivityAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
