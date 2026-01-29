export type ItemType = "exam" | "resource";

export type ItemResourceMediaType =
  | "file"
  | "image"
  | "pdf"
  | "video"
  | "link"
  | "text";

export type ExamType = "quiz" | "assignment";

export const itemTypes = [
  "audio",
  "quiz",
  "video",
  "text",
  "image",
  "pdf",
  "link",
];

export type AccessLevel = "free" | "premium" | "members_only";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";

export type SubmissionFormat = "text" | "file" | "url" | "both";

export interface Item {
  _id: string;
  id: string;
  title: string;
  description?: string;
  type: ItemType;
  courseId: {
    _id: string;
    title: string;
    instructor: string;
    category?: string;
  };
  sectionId: {
    id: string;
    order: number;

    title: string;
    _id: string;
  };
  lessonId: {
    courseId: string;
    id: string;
    order: number;
    sectionId: string;
    title: string;
    _id: string;
  };
  nextItem: {
    mediaType: string;
    _id: string;
    title: string;
    order: number;
    courseId: {
      _id: string;
      title: string;
      instructor: string;
    };
    lessonId: {
      order: number;
      title: string;
      _id: string;
    };
    sectionId: {
      order: number;
      title: string;
      _id: string;
    };
  };
  order: number;
  content: ItemContent;
  isRequired: boolean;
  isPublished: boolean;
  isPreview: boolean;
  estimatedDuration: number;
  viewCount: number;
  completionCount: number;
  legacyRefs?: LegacyRefs;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
  status: string;
  contentSummary: ItemContent;
}

export interface ItemContent {
  text?: string;
  url?: string;
  duration?: number;
  fileSize?: number;
  fileName?: string;
  fileExtension?: string;
  mediaType?: string;
  resource?: File | null;

  examType?: "quiz" | "assignment";
  examTitle?: string;
  examDesc?: string;
  quizzes?: unknown[];
  quizzesRaw?: string;

  questionCount: number;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultsImmedately?: boolean;

  submissionFormat?: SubmissionFormat;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  dueDate?: string;
  status: string;
  downloadable?: boolean;
  externalLink?: string;
  description: string;
  exam: {
    quizzes: {
      answer_type: number;
      question: string;
      answers: Answer[];
    }[];
  };
}

export interface Answer {
  explanation: string;
  is_correct: boolean;
  label: string;
  left: string;
  right: string;
}

export interface Question {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | number | string[];
  explanation?: string;
  points: number;
}

export interface LegacyRefs {
  examId?: string;
  quizId?: string;
  resourceId?: string;
  uploadId?: string;
}

export interface EnrolledItem {
  content: {
    mediaType: string | undefined;
  };
  _id: string;
  title: string;
  type: string;
  courseId: {
    _id: string;
    title: string;
  };
  sectionId: string;
  lessonId: string;
  order: number;
}

export interface CreateItemRequest {
  title: string;
  description?: string;
  type: ItemType;
  courseId: {
    _id: string;
    title: string;
    instructor: string;
    category?: string;
  };
  sectionId: { _id: string; title: string };
  lessonId: string;
  order?: number;
  content?: Partial<ItemContent>;
  isRequired?: boolean;
  isPublished?: boolean;
  isPreview?: boolean;
  estimatedDuration?: number;
  accessLevel?: AccessLevel;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  legacyRefs?: Partial<LegacyRefs>;
}

export interface ItemFilters {
  type?: ItemType;
  isRequired?: boolean;
  isPublished?: boolean;
  isPreview?: boolean;
  accessLevel?: AccessLevel;
  search?: string;
  lessonId?: string;
  sectionId?: string;
  courseId?: string;
  status?: string;
  sortBy?: "createdAt" | "title" | "order" | "viewCount" | "completionCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ItemAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
