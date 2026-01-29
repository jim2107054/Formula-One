"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Box, Card, Flex, RadioGroup, Text, TextField } from "@radix-ui/themes";
import FormAction from "../../_components/form/form-action";
import TipTapEditor from "@/components/common/TipTapEditor";
import { InputLabel } from "../../_components/input-label";

export const tagFormSchema = z.object({
  title: z
    .string()
    .min(2, "Title is required")
    .max(100, "Title must not exceed 100 characters")
    .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s\-&()]+$/, "Title must contain letters")
    .refine((val) => val.trim().length > 0, "Title cannot be empty"),
  desc: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .refine(
      (val) => val.replace(/<(.|\n)*?>/g, "").trim().length > 0,
      "Description is required"
    ),
  is_published: z.boolean(),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

interface TagFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<TagFormValues>;
  loading?: boolean;
  onSubmit: (data: TagFormValues) => void;
  onChange?: (field: keyof TagFormValues, value: string | boolean) => void;
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

export default function TagForm({
  mode,
  initialValues,
  onSubmit,
  onChange,
  loading,
}: TagFormProps) {
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      title: "",
      desc: "",
      is_published: false,
      ...initialValues,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card mt="4">
        <Flex direction="column" gap="6" p="4">
          {/* Title */}
          <Box>
            <Label required>Tag Title</Label>
            <TextField.Root
              placeholder="Enter tag title"
              value={watch("title")}
              onChange={(e) => {
                setValue("title", e.target.value, { shouldDirty: true });
                onChange?.("title", e.target.value);
              }}
              disabled={loading}
              className="flex-1"
            />
            {errors.title && <Text color="red">{errors.title.message}</Text>}
          </Box>

          {/* Description */}
          <Box>
            <Label required>Description</Label>
            <Controller
              control={control}
              name="desc"
              render={({ field }) => (
                <TipTapEditor
                  value={field.value || ""}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue("desc", val, { shouldDirty: true });
                    onChange?.("desc", val);
                  }}
                  height={200}
                />
              )}
            />
            {errors.desc && <Text color="red">{errors.desc.message}</Text>}
          </Box>

          {/* Status */}
          <Box>
            <InputLabel>Status</InputLabel>
            <RadioGroup.Root
              value={watch("is_published") ? "published" : "draft"}
              onValueChange={(val) => {
                const boolVal = val === "published";
                setValue("is_published", boolVal, { shouldDirty: true });
                onChange?.("is_published", boolVal);
              }}
              color="cyan"
            >
              <Flex direction="row" gap="4">
                <Text as="label" size="2" className="cursor-pointer">
                  <RadioGroup.Item value="draft" /> Draft
                </Text>
                <Text as="label" size="2" className="cursor-pointer">
                  <RadioGroup.Item value="published" /> Published
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
            ? "Update Tag"
            : "Create Tag"
        }
        loading={loading}
        hasUnsavedChanges={isDirty}
      />
    </form>
  );
}
