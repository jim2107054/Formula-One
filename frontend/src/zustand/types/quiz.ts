export interface Answer {
  label?: string;
  is_correct: boolean;
}

export interface Quiz {
  id: string;
  creator: string;
  exam: string;
  question?: string;
  media_url?: string;
  answer_type?: number;
  answers?: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizRequest {
  creator: string;
  exam: string;
  question?: string;
  media_url?: string;
  answer_type?: number;
  answers?: Answer[];
}

export type UpdateQuizRequest = Partial<CreateQuizRequest>;

export interface QuizFilters {
  creator?: string;
  exam?: string;
  search?: string;
  sortBy?: "createdAt" | "question";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface QuizAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
