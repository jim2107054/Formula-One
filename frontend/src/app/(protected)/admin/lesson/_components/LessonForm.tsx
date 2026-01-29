"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Card,
  Flex,
  Text,
  Separator,
  RadioGroup,
  TextField,
} from "@radix-ui/themes";
import FormAction from "../../_components/form/form-action";
import ModuleSearch from "../../_components/search-selector/module-searchbar";
import SectionSearch from "../../_components/search-selector/section-searchbar";
import TipTapEditor from "@/components/common/TipTapEditor";
import { InputLabel } from "../../_components/input-label";

export type LessonFormValues = {
  title: string;
  description?: string;
  isPublished: boolean;
};

interface LessonFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<LessonFormValues>;
  loading?: boolean;
  onSubmit: (data: LessonFormValues) => void;

  selectedCourseId?: string;
  selectedSectionId?: string;
  onCourseChange: (id: string) => void;
  onSectionChange: (id: string) => void;
  courseOptions?: { id: string; title: string }[];
  sectionOptions?: { id: string; title: string }[];
  loadingCourses?: boolean;
  loadingSections?: boolean;
}

const Label = ({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Text as="label" size="2" weight="medium" mb="2">
    {children}{" "}
    {required && (
      <Text as="label" color="red">
        *
      </Text>
    )}
  </Text>
);

export default function LessonForm({
  mode,
  initialValues,
  loading,
  onSubmit,
  selectedCourseId,
  selectedSectionId,
  onCourseChange,
  onSectionChange,
  loadingCourses = false,
  loadingSections = false,
}: LessonFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LessonFormValues>({
    defaultValues: {
      title: "",
      description: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({
        title: initialValues.title ?? "",
        description: initialValues.description ?? "",
        isPublished: initialValues.isPublished ?? false,
      });
    }
  }, [mode, initialValues, reset]);

  // Calculate if all prerequisites are selected for create mode
  const allPrerequisitesSelected = Boolean(
    selectedCourseId && selectedSectionId
  );

  const handleCourseChange = (id: string) => {
    if (id) {
      onCourseChange(id);
    } else {
      onCourseChange("");
      onSectionChange("");
    }
  };

  // Handle section selection
  const handleSectionChange = (id: string) => {
    if (id) {
      onSectionChange(id);
    } else {
      onSectionChange("");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <Flex direction="column" gap="6" p="4">
          {/* Module Selector */}
          <Box>
            <Label required>Select Module</Label>
            <ModuleSearch
              value={selectedCourseId || ""}
              onSelectModule={handleCourseChange}
              placeholder="Search or select a module..."
              disabled={loadingCourses}
              width="100%"
            />
          </Box>

          {/* Section Selector */}
          <Box>
            <Label required>Select Section</Label>
            <SectionSearch
              value={selectedSectionId || ""}
              onSelectSection={handleSectionChange}
              width="100%"
              placeholder={
                !selectedCourseId
                  ? "Select a module first"
                  : loadingSections
                  ? "Loading sections..."
                  : "Search or select a section..."
              }
              disabled={!selectedCourseId || loadingSections}
              courseId={selectedCourseId}
            />
          </Box>

          <Separator size="4" />

          {/* Lesson Fields - Show in reduced opacity when prerequisites not selected */}
          <Box
            style={{
              opacity: mode === "create" && !allPrerequisitesSelected ? 0.5 : 1,
              pointerEvents:
                mode === "create" && !allPrerequisitesSelected
                  ? "none"
                  : "auto",
              transition: "opacity 0.2s ease",
              cursor:
                mode === "create" && !allPrerequisitesSelected
                  ? "not-allowed"
                  : "auto",
            }}
          >
            <Flex direction="column" gap="6">
              {/* Lesson Title */}
              <Box>
                <Label required>Title</Label>
                <TextField.Root
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded p-2 text-sm"
                  placeholder="Enter lesson title"
                  disabled={mode === "create" && !allPrerequisitesSelected}
                />
                {errors.title && (
                  <Text size="1" color="red">
                    {errors.title.message}
                  </Text>
                )}
              </Box>

              {/* Lesson Description */}
              <Box>
                <Label>Description</Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <TipTapEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter lesson description..."
                      height={200}
                    />
                  )}
                />
              </Box>

              {/* Status */}
              <Box>
                <InputLabel>Status</InputLabel>
                <RadioGroup.Root
                  value={watch("isPublished") ? "published" : "draft"}
                  onValueChange={(value) =>
                    setValue("isPublished", value === "published", {
                      shouldDirty: true,
                    })
                  }
                  color="cyan"
                  disabled={mode === "create" && !allPrerequisitesSelected}
                >
                  <Flex direction="row" gap="4">
                    <Text as="label" size="2" className="cursor-pointer">
                      <RadioGroup.Item value="draft" />
                      Draft
                    </Text>
                    <Text as="label" size="2" className="cursor-pointer">
                      <RadioGroup.Item value="published" />
                      Published
                    </Text>
                  </Flex>
                </RadioGroup.Root>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Form Actions - Show only when prerequisites are selected or in edit mode */}
      {(mode === "edit" || allPrerequisitesSelected) && (
        <FormAction
          saveLabel={
            loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Lesson"
              : "Create Lesson"
          }
          loading={loading}
          hasUnsavedChanges={isDirty}
        />
      )}
    </form>
  );
}
