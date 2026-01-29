export interface CompletedItem {
  itemId: string;
  completedAt: string;
  timeSpent?: number;
  score?: number;
  attempts?: number;
}

export interface CompletedLesson {
  lessonId: string;
  completedAt: string;
  totalTimeSpent?: number;
  completionPercentage?: number;
}

export interface CompletedSection {
  sectionId: string;
  completedAt: string;
  totalTimeSpent?: number;
  completionPercentage?: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  completedItems?: CompletedItem[];
  completedLessons?: CompletedLesson[];
  completedSections?: CompletedSection[];
  courseCompleted?: boolean;
  courseCompletedAt?: string;
  totalCourseTimeSpent?: number;
  courseCompletionPercentage?: number;
  totalItemsCompleted?: number;
  totalLessonsCompleted?: number;
  totalSectionsCompleted?: number;
  currentItem?: string;
  currentLesson?: string;
  currentSection?: string;
  enrolledAt: string;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  statistics: Statistics;
}

export interface Statistics {
  completedItems: number;
  completedLessons: number;
  completedSections: number;
  totalItems: number;
  totalLessons: number;
  totalSections: number;
  totalTimeSpent: number;
}

export interface CreateUserProgressRequest {
  userId: string;
  courseId: string;
  enrolledAt?: string;
}

export interface UpdateUserProgressRequest
  extends Partial<CreateUserProgressRequest> {
  completedItems?: CompletedItem[];
  completedLessons?: CompletedLesson[];
  completedSections?: CompletedSection[];
  courseCompleted?: boolean;
  courseCompletedAt?: string;
  totalCourseTimeSpent?: number;
  courseCompletionPercentage?: number;
  totalItemsCompleted?: number;
  totalLessonsCompleted?: number;
  totalSectionsCompleted?: number;
  currentItem?: string;
  currentLesson?: string;
  currentSection?: string;
  lastAccessedAt?: string;
}

export interface UserProgressFilters {
  userId?: string;
  courseId?: string;
  courseCompleted?: boolean;
  search?: string;
  sortBy?:
    | "createdAt"
    | "enrolledAt"
    | "lastAccessedAt"
    | "courseCompletionPercentage";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UserProgressAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
