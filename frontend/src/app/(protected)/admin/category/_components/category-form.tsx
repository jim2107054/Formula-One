"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Box, Card, Flex, Text, RadioGroup, TextField } from "@radix-ui/themes";
import FormAction from "../../_components/form/form-action";
import TipTapEditor from "@/components/common/TipTapEditor";
import { InputLabel } from "../../_components/input-label";

export const categorySchema = z.object({
  title: z.string().nonempty("Title is required"),
  desc: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .nonempty("Description is required"),
  is_published: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<CategoryFormValues>;
  loading?: boolean;
  onSubmit: (data: CategoryFormValues) => void;
  onChange?: (field: keyof CategoryFormValues, value: string | boolean) => void;
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

export default function CategoryForm({
  mode,
  initialValues,
  onSubmit,
  onChange,
  loading,
}: CategoryFormProps) {
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: "",
      desc: "",
      is_published: false,
      ...initialValues,
    },
    mode: "onBlur",
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
            <Label required>Category Title</Label>
            <TextField.Root
              placeholder="Enter category title"
              value={watch("title")}
              onChange={(e) => {
                setValue("title", e.target.value, { shouldDirty: true });
                onChange?.("title", e.target.value);
              }}
              className="flex-1"
              disabled={loading}
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
                  onChange={(val: string) => {
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
              onValueChange={(val: string) => {
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
            ? "Update Category"
            : "Create Category"
        }
        loading={loading}
        hasUnsavedChanges={isDirty}
      />
    </form>
  );
}
