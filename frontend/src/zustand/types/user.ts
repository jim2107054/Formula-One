import { AsyncState } from "./auth";
import { PaginatedResponse } from "./pagination";

// CORE ROLE TYPE - matches backend exactly
export type UserRole = 0 | 1 | 2; // 0 = student, 1 = instructor, 2 = admin

// UI LABELS for display only
export const ROLE_LABELS: Record<UserRole, string> = {
  0: "Student",
  1: "Instructor",
  2: "Admin",
};

// Convert role number to display label
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}

// Convert role number to lowercase string for certain UI needs
export function getRoleString(
  role: UserRole
): "student" | "instructor" | "admin" {
  switch (role) {
    case 0:
      return "student";
    case 1:
      return "instructor";
    case 2:
      return "admin";
  }
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  gender?: string;
  dob?: string;
  note?: string;
  password: string;
  pass?: string;
  imageUrl: string;
  photo_url?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  teacher_verified?: boolean;
  is_custom?: boolean;
  tokenVersions: [];
  createdAt: string;
  updatedAt: string;
}

export interface UserAPIResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  email_verified?: boolean;
  phone_verified?: boolean;
  teacher_verified?: boolean;
  gender?: string;
}

// Legacy interface for backward compatibility during migration
export interface PaginationMeta {
  previous: number | null;
  next: number | null;
  total: number;
  page_size: number;
}

// Legacy response interface for backward compatibility
export interface UserListResponse {
  meta: PaginationMeta;
  entries: User[];
}

// New backend-aligned response interface
export type UserPaginatedResponse = PaginatedResponse<User>;

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  gender?: string;
  dob?: string;
  phone?: string;
  note?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  note?: string;
  role?: UserRole;
  email_verified?: boolean;
  phone_verified?: boolean;
  is_custom?: boolean;
  teacher_verified?: boolean;
  password?: string;
  profile?: File | null;
}

export interface UserState extends AsyncState<UserPaginatedResponse | User> {
  selectedUser: User | null;
  filters: UserFilters;
  pagination: {
    page: number;
    limit: number;
  };
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  email_verified?: boolean;
  phone_verified?: boolean;
  teacher_verified?: boolean;
  gender?: string;
  courseId?: string;
}
