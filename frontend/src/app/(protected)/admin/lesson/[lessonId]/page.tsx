"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Container, DropdownMenu, Text, Button } from "@radix-ui/themes";
import { BiDotsVertical, BiTrash } from "react-icons/bi";
import { useParams, useSearchParams } from "next/navigation";

import LessonForm, { LessonFormValues } from "../_components/LessonForm";
import FormHeader from "../../_components/form/form-header";
import {
  useLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks/queries/useLessonQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MdEditSquare } from "react-icons/md";

export default function LessonDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : (params.lessonId as string);
  const isEditMode = searchParams.get("edit") === "true";

  const { data: currentLesson, isLoading, error } = useLesson(lessonId);

  const updateLesson = useUpdateLesson({ onSuccess: () => router.back() });
  const deleteLesson = useDeleteLesson({ onSuccess: () => router.back() });

  const [isEditing, setIsEditing] = useState(isEditMode);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Text color="red">Error loading lesson</Text>;
  if (!currentLesson) return <Text>Lesson not found</Text>;

  const handleSubmit = (data: LessonFormValues) => {
    updateLesson.mutate({ id: currentLesson._id, data });
  };

  return (
    <Container size="3">
      <FormHeader
        title="Edit Lesson"
        subtitle="Update lesson details and settings"
        course={currentLesson.courseId}
        section={currentLesson.sectionId}
        lesson={currentLesson}
      />

      <Box position="relative">
        {!isEditing && (
          <Box position="absolute" top="4" right="4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost">
                  <BiDotsVertical />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onClick={() => setIsEditing(true)}>
                  <MdEditSquare /> Edit lesson
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onClick={() => deleteLesson.mutate(currentLesson._id)}
                  disabled={deleteLesson.isPending}
                >
                  <BiTrash /> Delete lesson
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
        )}

        {isEditing && (
          <LessonForm
            mode="edit"
            initialValues={currentLesson}
            loading={updateLesson.isPending}
            onSubmit={handleSubmit}
            selectedCourseId={currentLesson.courseId._id}
            selectedSectionId={currentLesson.sectionId._id}
            onCourseChange={() => {}}
            onSectionChange={() => {}}
            courseOptions={[
              {
                id: currentLesson.courseId._id,
                title: currentLesson.courseId.title,
              },
            ]}
            sectionOptions={[
              {
                id: currentLesson.sectionId._id,
                title: currentLesson.sectionId.title,
              },
            ]}
            loadingCourses={false}
            loadingSections={false}
          />
        )}
      </Box>
    </Container>
  );
}
