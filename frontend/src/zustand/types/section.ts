import { Lesson } from "./lesson";

export interface Section {
  _id: string;
  id: string;
  title: string;
  description?: string;
  totalLessons: number;
  completedLessons: number;
  isSpecial: boolean;
  state: string;
  nextSectionId?: string;
  previousSectionId?: string;
  continueLessonId: string;
  sections: {
    courseId: {
      _id: string;
      id: string;
      instructor: string;
      title: string;
    };
    id: string;
    isPublished: boolean;
    order: number;
    title: string;
  };
  courseId?: // | string
  {
    _id: string;
    // id: string;
    title: string;
    category: string;
    instructor: string;
  };
  order: number;

  lessons: Lesson[];
  duration: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  // VIRTUALS
  lessonsCount?: number;
  itemsCount?: number;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  courseId?: string;
  order?: number;
  duration?: number;
  isPublished?: boolean;
}

export type UpdateSectionRequest = Partial<CreateSectionRequest>;

export interface SectionFilters {
  courseId?: string;
  isPublished?: boolean;
  search?: string;
  sortBy?: "createdAt" | "title" | "order" | "duration";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SectionAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SectionWithLessons {
  section: Section;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
}
