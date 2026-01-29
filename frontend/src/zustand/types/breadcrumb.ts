import { Course } from "./course";
import { Item } from "./item";
import { Lesson } from "./lesson";
import { Section } from "./section";

interface BreadcrumbData {
  currentLevel: string;
  levels: {
    id: string;
    isActive: boolean;
    slug: string;
    title: string;
    type: string;
    url: string;
  }[];
  navigation: {
    course: Course | null;
    item: Item | null;
    lesson: Lesson | null;
    section: Section | null;
  };
}

export interface BreadcrumbStore {
  breadcrumbData: BreadcrumbData | null;
  loading: boolean;
  error: string | null;
  getBreadcrumb: (
    courseId: string,
    sectionId: string,
    lessonId: string,
    itemId: string
  ) => Promise<void>;
}
