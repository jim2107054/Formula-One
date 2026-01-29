import { UserRole } from "./user";

export type EnrollmentStatus = "pending" | "paid" | "canceled" | "refunded";

export interface PopulatedUserInsideEnroll {
  _id: string;
  name: string;
  email: string;
  gender?: string;
  role: UserRole;
  photo_url?: string;
  createdAt: string;
}

export interface PopulatedCourseInsideEnroll {
  _id: string;
  id: string;
  title: string;
  slug: string;
  price: number;
  language: string;
  isPublished: boolean;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  isCertificateAvailable?: boolean;
  currentSection: {
    id: string;
    _id: string;
    title: string;
  };
  totalSections?: number; // Added for learners
  completedSections?: number; // Added for learners
}
export interface AllEnrolledrollmentData {
  type: string;
  mediaType: string;
  title: string;
  url: string;
}
export interface Enroll {
  _id: string;
  idx?: number;
  continued_course: boolean;

  commission?: number;
  total_amount?: number;
  teacher_amount?: number;
  net_amount?: number;
  status?: EnrollmentStatus;
  user?: PopulatedUserInsideEnroll;
  teacher?: PopulatedUserInsideEnroll;
  course?: PopulatedCourseInsideEnroll;
  enrolled_by?: string;
  method?: string;
  address?: string;
  note?: string;
  is_admin_enroll?: boolean;
  expires_at?: string;
  is_expired?: boolean;
  lifetime_access?: boolean;
  certification_url?: string | null;
  certificate_id?: string | null;
  allow_download_certificate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollRequest {
  commission?: number;
  total_amount?: number;
  teacher_amount?: number;
  net_amount?: number;
  status?: EnrollmentStatus;
  user?: string;
  teacher?: string;
  course?: string;
  enrolled_by?: string;
  method?: string;
  address?: string;
  note?: string;
  is_admin_enroll?: boolean;
  expires_at?: string | null;
  lifetime_access?: boolean;
  certificate_id?: string;
  allow_download_certificate?: boolean;
}

export type UpdateEnrollRequest = Partial<CreateEnrollRequest>;

export interface EnrollFilters {
  user?: string;
  teacher?: string;
  course?: string;
  status?: string;
  is_expired?: boolean;
  search?: string;
  sortBy?: "createdAt" | "total_amount" | "idx";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  idx?: number;
}

export interface EnrollAPIResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
  error?: string;
}
