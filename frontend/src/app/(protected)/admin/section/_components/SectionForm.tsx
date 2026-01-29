"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TipTapEditor from "@/components/common/TipTapEditor";
import { Box, Card, Flex, Text, RadioGroup, TextField } from "@radix-ui/themes";
import FormAction from "../../_components/form/form-action";
import ModuleSearch from "../../_components/search-selector/module-searchbar";
import { InputLabel } from "../../_components/input-label";

export const sectionSchema = z.object({
  courseId: z.string().min(1, "Module is required"),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional(),
  isPublished: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<SectionFormValues>;
  loading?: boolean;
  onSubmit: (data: SectionFormValues) => void;
  selectedCourseId: string;
  onCourseChange?: (id: string) => void;
  courseOptions?: { id: string; title: string }[];
  loadingCourses?: boolean;
}

const Label = ({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Text size="2" weight="medium" mb="2">
    {children}{" "}
    {required && (
      <Text as="span" color="red">
        *
      </Text>
    )}
  </Text>
);

export default function SectionForm({
  mode,
  initialValues,
  loading,
  onSubmit,
  selectedCourseId,
  onCourseChange,
}: SectionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      courseId: selectedCourseId,
      title: "",
      description: "",
      isPublished: false,
      ...initialValues,
    },
  });

  const courseIdValue = watch("courseId");

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({ ...initialValues });
    }
  }, [initialValues, mode, reset]);

  // Sync the selected course ID when it changes
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== courseIdValue) {
      setValue("courseId", selectedCourseId);
    }
  }, [selectedCourseId, courseIdValue, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <Flex direction="column" gap="6" p="4">
          {/* Module Selector */}
          {onCourseChange && (
            <Box>
              <Label required>Select Module</Label>
              <ModuleSearch
                value={courseIdValue}
                onSelectModule={(id) => {
                  setValue("courseId", id);

                  if (onCourseChange) {
                    onCourseChange(id);
                  }
                }}
                width="100%"
              />

              {errors.courseId && !watch("courseId") && (
                <Text size="1" color="red" mt="1">
                  {errors.courseId.message}
                </Text>
              )}
            </Box>
          )}

          {/* Section Title */}
          <Box>
            <Label required>Section Title</Label>
            <TextField.Root
              {...register("title")}
              className="w-full rounded p-2 text-sm"
              placeholder="Enter section title"
            />
            {errors.title && (
              <Text size="1" color="red">
                {errors.title.message}
              </Text>
            )}
          </Box>

          {/* Description */}
          <Box>
            <Label>Description</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TipTapEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Enter section description..."
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
              onValueChange={(val) =>
                setValue("isPublished", val === "published", {
                  shouldDirty: true,
                })
              }
              color="cyan"
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
      </Card>

      <FormAction
        saveLabel={
          loading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Section"
            : "Create Section"
        }
        loading={loading}
        hasUnsavedChanges={isDirty}
      />
    </form>
  );
}
