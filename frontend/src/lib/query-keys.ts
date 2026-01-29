import type { CourseFilters } from "@/zustand/types/course";
import type { EnrollFilters } from "@/zustand/types/enroll";
import type { ItemFilters } from "@/zustand/types/item";
import type { LessonFilters } from "@/zustand/types/lesson";
import type { SectionFilters } from "@/zustand/types/section";

export const queryKeys = {
  // Course keys
  courses: {
    all: ["courses"] as const,
    lists: () => [...queryKeys.courses.all, "list"] as const,
    list: (filters: Partial<CourseFilters>) =>
      [...queryKeys.courses.lists(), filters] as const,
    // infinite: (filters: Partial<CourseFilters>) =>
    //   [...queryKeys.courses.lists(), "infinite", filters] as const,
    details: () => [...queryKeys.courses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.courses.all, "slug", slug] as const,
    withSections: (id: string) =>
      [...queryKeys.courses.detail(id), "sections"] as const,
    stats: (id: string) => [...queryKeys.courses.detail(id), "stats"] as const,
  },

  // Section keys
  sections: {
    all: ["sections"] as const,
    lists: () => [...queryKeys.sections.all, "list"] as const,
    list: (filters: Partial<SectionFilters>) =>
      [...queryKeys.sections.lists(), filters] as const,
    details: () => [...queryKeys.sections.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.sections.details(), id] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.sections.all, "course", courseId] as const,
    withLessons: (id: string) =>
      [...queryKeys.sections.detail(id), "lessons"] as const,
  },

  // Lesson keys
  lessons: {
    all: ["lessons"] as const,
    lists: () => [...queryKeys.lessons.all, "list"] as const,
    list: (filters: Partial<LessonFilters>) =>
      [...queryKeys.lessons.lists(), filters] as const,
    details: () => [...queryKeys.lessons.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.lessons.details(), id] as const,
    bySection: (sectionId: string) =>
      [...queryKeys.lessons.all, "section", sectionId] as const,
    withItems: (id: string) =>
      [...queryKeys.lessons.detail(id), "items"] as const,
  },

  // Item keys
  items: {
    all: ["items"] as const,
    lists: () => [...queryKeys.items.all, "list"] as const,
    list: (filters: Partial<ItemFilters>) =>
      [...queryKeys.items.lists(), filters] as const,
    details: () => [...queryKeys.items.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.items.details(), id] as const,
    byLesson: (lessonId: string) =>
      [...queryKeys.items.all, "lesson", lessonId] as const,
  },

  // Enrollment keys
  enrollments: {
    all: ["enrollments"] as const,
    lists: () => [...queryKeys.enrollments.all, "list"] as const,
    list: (filters: Partial<EnrollFilters>) =>
      [...queryKeys.enrollments.lists(), filters] as const,
    details: () => [...queryKeys.enrollments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.enrollments.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.enrollments.all, "user", userId] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.enrollments.all, "course", courseId] as const,
    byTeacher: (teacherId: string) =>
      [...queryKeys.enrollments.all, "teacher", teacherId] as const,
  },
} as const;
