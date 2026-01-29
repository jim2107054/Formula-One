export interface ExamQuiz {
  is_extra?: boolean;
  is_hidden?: boolean;
  question?: string;
  answer_type?: number;
  answers?: unknown[];
  media_url?: string;
  hint?: string;
}

export interface Exam {
  id: string;
  creator: string;
  module: string;
  title?: string;
  desc?: string;
  quizzes?: ExamQuiz[];
  createAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  creator: string;
  module: string;
  title?: string;
  desc?: string;
  quizzes?: ExamQuiz[];
}

export type UpdateExamRequest = Partial<CreateExamRequest>;

export interface ExamFilters {
  creator?: string;
  module?: string;
  search?: string;
  sortBy?: "createdAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ExamAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
