import { Section } from "./section";
import { StatusType } from "./status";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type ItemType =
  | "exam"
  | "quiz"
  | "resource"
  | "upload"
  | "video"
  | "text"
  | "pdf"
  | "assignment";
export type AccessLevel = "free" | "premium" | "members_only";
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";
export type SubmissionFormat = "text" | "file" | "url" | "both";

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  instructorId: string;
  slug: string;
  level: CourseLevel;
  category: string;
  price: number;
  status: StatusType;
  tags: string[];
  sections: string[];
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  features: string;
  requirements: string;
  whatYouWillLearn: string;
  language: string;
  isPublished: boolean;
  isCertificateAvailable: boolean;
  createdAt: string;
  updatedAt: string;

  // VIRTUALS
  sectionsCount?: number;
  lessonsCount?: number;
  itemsCount?: number;
  enrolledCount?: number;
  completedCount?: number;
  completedSections: number;
  totalSections: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: CourseLevel;
  category: string;
  // price?: number;
  tags: string[];
  features: string;
  requirements: string;
  whatYouWillLearn: string;
  language: string;
  instructor?: { _id: string; name: string; email: string };
  instructorId: string;
  isPublished: boolean;
  isCertificateAvailable: boolean;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  slug?: string;
}

export interface CourseFilters {
  status?: StatusType;
  level?: CourseLevel;
  search?: string;
  sortBy?: "createdAt" | "title" | "price" | "rating" | "enrollmentCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  category?: string;
  instructorId?: string;
}

export interface CourseAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: true;
    hasPrevPage: false;
  };
  message?: string;
}

export interface CourseWithSections {
  course: Course;
  certificate: {
    allow_download_certificate: boolean;
    certification_url: string;
    enrollId: string;
  };
  sections: Section[];
  totalSections: number;
  continueSectionId: string | null;
  completedSections: number;
}

export interface CourseStats {
  courses: string;
  stats: {
    sections: number;
    lessons: number;
    items: number;
    status: StatusType;
    level: CourseLevel;
    createdAt: string;
  };
}
