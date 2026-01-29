"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Container, DropdownMenu, Text, Button } from "@radix-ui/themes";
import { BiDotsVertical, BiTrash } from "react-icons/bi";
import { useParams, useSearchParams } from "next/navigation";

import SectionForm, { SectionFormValues } from "../_components/SectionForm";
import FormHeader from "../../_components/form/form-header";
import {
  useSection,
  useUpdateSection,
  useDeleteSection,
} from "@/hooks/queries/useSectionQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { MdEditSquare } from "react-icons/md";

export default function SectionDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sectionId = Array.isArray(params.sectionId)
    ? params.sectionId[0]
    : (params.sectionId as string);
  const isEditMode = searchParams.get("edit") === "true";

  const { data: currentSection, isLoading, error } = useSection(sectionId);
  console.log("Current Section", currentSection);

  const updateSection = useUpdateSection({ onSuccess: () => router.back() });
  const deleteSection = useDeleteSection({ onSuccess: () => router.back() });

  const [isEditing, setIsEditing] = useState(isEditMode);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <Text color="red">
        Error loading section: {error.message || "Unknown error"}
      </Text>
    );
  if (!currentSection) return <Text>Section not found</Text>;

  const handleSubmit = (data: SectionFormValues) => {
    if (!currentSection) return;
    updateSection.mutate({ id: currentSection._id, data });
  };

  return (
    <Container size="3">
      <FormHeader
        title="Edit Section"
        subtitle="Update section details and settings"
        course={currentSection.courseId}
        section={currentSection}
        activeLevel="section"
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
                  <MdEditSquare /> Edit Section
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onClick={() => deleteSection.mutate(currentSection._id)}
                  disabled={deleteSection.isPending}
                >
                  <BiTrash /> Delete Section
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
        )}

        {isEditing && (
          <SectionForm
            mode="edit"
            // initialValues={currentSection}
            initialValues={{
              ...currentSection,
              courseId:
                typeof currentSection.courseId === "object"
                  ? currentSection.courseId._id
                  : String(currentSection.courseId),
            }}
            loading={updateSection.isPending}
            onSubmit={handleSubmit}
            selectedCourseId={
              typeof currentSection.courseId === "object"
                ? currentSection.courseId._id
                : String(currentSection.courseId)
            }
            onCourseChange={() => {}}
            courseOptions={[
              {
                id:
                  typeof currentSection.courseId === "object"
                    ? currentSection.courseId._id
                    : String(currentSection.courseId),
                title:
                  typeof currentSection.courseId === "object"
                    ? currentSection.courseId.title
                    : "Unknown Module",
              },
            ]}
            loadingCourses={false}
          />
        )}
      </Box>
    </Container>
  );
}
