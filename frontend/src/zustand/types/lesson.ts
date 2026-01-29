import { Course } from "./course";
import { Section } from "./section";

export interface Lesson {
  _id: string;
  id: string;
  title: string;
  description: string;
  courseId: Course;
  sectionId: Section;
  order: number;
  completedItems: number;

  items: {
    _id: string;
    order: number;
    status: string;
    title: string;
    type: string;
    mediaType: string;
  }[];
  isPublished: boolean;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
  state: string;
  status: string;
  totalItems: number;
  itemCount: number;
  requiredItemsCount: number;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  courseId: string;
  sectionId: string;
  order?: number;
  duration?: number;
  isPublished?: boolean;
  isPreview?: boolean;
}

export type UpdateLessonRequest = Partial<CreateLessonRequest>;

export interface LessonFilters {
  courseId?: string;
  sectionId?: string;
  isPublished?: boolean;
  isPreview?: boolean;
  search?: string;
  sortBy?: "createdAt" | "title" | "order" | "duration";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface LessonAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LessonWithItems {
  completedItems: number;
  continueItemId: string;
  totalItems: number;
  previousLesson: {
    courseId: string;
    id: string;
    sectionId: string;
  };
  nextLesson: {
    courseId: string;
    id: string;
    sectionId: string;
  };
  items: {
    id: string;
    order: number;
    status: string;
    title: string;
    type: string;
    mediaType: string;
  }[];
  lessons: {
    courseId: { id: string; title: string };
    duration: number;
    id: string;
    isPublished: boolean;
    order: number;
    title: string;
    sectionId: {
      id: string;
      order: number;
      state: string | null;
      title: string;
    };
  };
}
