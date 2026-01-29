"use client";

import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import type { Course } from "@/zustand/types/course";
import type { Section } from "@/zustand/types/section";
import type { Lesson } from "@/zustand/types/lesson";
import type { Item } from "@/zustand/types/item";

export type RefLike =
  | string
  | { _id?: string; id?: string; title?: string }
  | undefined;

export function normalizeRef(ref?: RefLike): { id: string; title: string } {
  if (!ref) return { id: "", title: "" };
  if (typeof ref === "string") return { id: ref, title: "" };

  const possibleRef = ref as { _id?: string; id?: string; title?: string };

  const id =
    typeof possibleRef._id === "string"
      ? possibleRef._id
      : typeof possibleRef.id === "string"
      ? possibleRef.id
      : "";

  const title =
    typeof possibleRef.title === "string" ? possibleRef.title : id;

  return { id, title };
}

export interface AdminBreadcrumbProps {
  course?: RefLike | Course | null;
  section?: RefLike | Section | null;
  lesson?: RefLike | Lesson | null;
  item?: RefLike | Item | null;
  activeLevel?: "course" | "section" | "lesson" | "item";
}

export default function AdminBreadcrumb({
  course,
  section,
  lesson,
  item,
  activeLevel,
}: AdminBreadcrumbProps) {
  const courseRef = normalizeRef(course as RefLike);
  const sectionRef = normalizeRef(section as RefLike);
  const lessonRef = normalizeRef(lesson as RefLike);
  const itemRef = normalizeRef(item as RefLike);

  const truncateText = (text: string, maxLength: number = 40): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  };

  const selectedCourse = courseRef.title || courseRef.id || "";
  const selectedSection = sectionRef.id
    ? { id: sectionRef.id, title: sectionRef.title }
    : undefined;
  const selectedLesson = lessonRef.id
    ? { id: lessonRef.id, title: lessonRef.title }
    : undefined;
  const selectedItem = itemRef.id
    ? { id: itemRef.id, title: itemRef.title }
    : undefined;

  const deriveActiveLevel = (): "course" | "section" | "lesson" | "item" => {
    if (activeLevel) return activeLevel;
    if (selectedItem) return "item";
    if (selectedLesson) return "lesson";
    if (selectedSection) return "section";
    return "course";
  };
  const active = deriveActiveLevel();

  return (
    <Flex align="center" gap="1" style={{ 
      maxWidth: "100%", 
      overflow: "hidden",
      flexWrap: "nowrap"
    }}>
      <Text
        size="1"
        weight={active === "course" ? "medium" : "regular"}
        style={active === "course" ? { color: "#0066cc" } : { color: "#666" }}
        title={selectedCourse}
      >
        {truncateText(selectedCourse)}
      </Text>
      
      {selectedSection && (
        <>
          <Text size="1" style={{ color: "#999", margin: "0 2px" }}>›</Text>
          <Text
            size="1"
            weight={active === "section" ? "medium" : "regular"}
            style={active === "section" ? { color: "#0066cc" } : { color: "#666" }}
            title={selectedSection.title}
          >
            {truncateText(selectedSection.title, 30)}
          </Text>
        </>
      )}
      
      {selectedLesson && (
        <>
          <Text size="1" style={{ color: "#999", margin: "0 2px" }}>›</Text>
          <Text
            size="1"
            weight={active === "lesson" ? "medium" : "regular"}
            style={active === "lesson" ? { color: "#0066cc" } : { color: "#666" }}
            title={selectedLesson.title}
          >
            {truncateText(selectedLesson.title, 25)}
          </Text>
        </>
      )}
      
      {selectedItem && (
        <>
          <Text size="1" style={{ color: "#999", margin: "0 2px" }}>›</Text>
          <Text
            size="1"
            weight={active === "item" ? "medium" : "regular"}
            style={active === "item" ? { color: "#0066cc" } : { color: "#666" }}
            title={selectedItem.title}
          >
            {truncateText(selectedItem.title, 20)}
          </Text>
        </>
      )}
    </Flex>
  );
}