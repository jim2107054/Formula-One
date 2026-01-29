export interface Schedule {
  id: string;
  module: string;
  title?: string;
  desc?: string;
  url?: string;
  startAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  module: string;
  title?: string;
  desc?: string;
  url?: string;
  startAt?: string;
}

export type UpdateScheduleRequest = Partial<CreateScheduleRequest>;

export interface ScheduleFilters {
  module?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "startAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ScheduleAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
