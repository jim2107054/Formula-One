"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { UserRole } from "@/zustand/types/user";

interface RoleProtectedLayoutProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
}

/**
 * Safely converts any role value to the UserRole type (0 | 1 | 2)
 */
const toUserRole = (role: unknown): UserRole => {
  // Handle number inputs
  if (typeof role === "number") {
    if (role === 0 || role === 1 || role === 2) {
      return role as UserRole;
    }
  }
  
  // Handle string inputs
  if (typeof role === "string") {
    // Parse numeric strings
    const parsed = parseInt(role, 10);
    if (parsed === 0 || parsed === 1 || parsed === 2) {
      return parsed as UserRole;
    }
    
    // Handle role names
    if (role === "admin") return 2;
    if (role === "instructor") return 1;
    if (role === "student") return 0;
  }
  
  // Default to student for invalid values
  console.warn(`Invalid role value: ${role}, defaulting to 0 (student)`);
  return 0;
};

/**
 * Checks if user has required role or higher permission
 * Role hierarchy: admin (2) > instructor (1) > student (0)
 */
const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole >= requiredRole;
};

/**
 * RoleProtectedLayout component that restricts access based on user role.
 * Uses role numbers: 0 = student, 1 = instructor, 2 = admin
 */
export default function RoleProtectedLayout({
  children,
  role: requiredRole,
  fallback,
}: RoleProtectedLayoutProps) {
  const { user, loading } = useAuth();

  // Show loading/fallback while checking authentication
  if (!user || loading) {
    return fallback || <LoadingSpinner />;
  }

  // Convert user role to proper type
  const userRole = toUserRole(user.role);

  // Check if user has required permissions
  if (!hasRole(userRole, requiredRole)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}