"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  RadioGroup,
  Separator,
  Select,
  Checkbox,
  Grid,
} from "@radix-ui/themes";
import TipTapEditor from "@/components/common/TipTapEditor";
import UserSearch from "../../_components/search-selector/user-search";
import CategorySearch from "../../_components/search-selector/category-search";
import TagSearchSelect from "../../_components/search-selector/tag-searchbar";
import FormAction from "../../_components/form/form-action";
import { CreateCourseRequest, Course } from "@/zustand/types/course";
import { InputLabel } from "../../_components/input-label";

const courseSchema = z.object({
  title: z.string().nonempty("Title is required"),
  instructorId: z.string().nonempty("Instructor is required"),
  category: z.string().nonempty("Category is required"),
  language: z.string().nonempty("Language is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  description: z.string().nonempty("Description is required"),
  whatYouWillLearn: z.string().nonempty("What You Will Learn is required"),
  requirements: z.string().nonempty("Requirements are required"),
  features: z.string().nonempty("Features are required"),
  // price: z.number().gt(0, "Price must be greater than 0"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  isPublished: z.boolean(),
  isCertificateAvailable: z.boolean(),
});

interface ModuleFormProps {
  mode: "create" | "edit";
  initialValues: Partial<CreateCourseRequest> & {
    instructor?: { _id: string; name: string; email: string };
  };
  loading?: boolean;
  onSubmit: (data: CreateCourseRequest) => void;
  onChange: (
    field: keyof CreateCourseRequest,
    value: CreateCourseRequest[keyof CreateCourseRequest]
  ) => void;
  courseData?: Course;
}

const contentFields: (keyof CreateCourseRequest)[] = [
  "description",
  "whatYouWillLearn",
  "requirements",
  "features",
];

export default function ModuleForm({
  mode,
  initialValues,
  onChange,
  onSubmit,
  loading,
}: ModuleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateCourseRequest>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      instructorId: "",
      category: "",
      language: "",
      tags: [],
      description: "",
      whatYouWillLearn: "",
      requirements: "",
      features: "",
      // price: 0,
      level: "beginner",
      isPublished: false,
      isCertificateAvailable: false,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  const handleStatusChange = (value: boolean) => {
    setValue("isPublished", value, { shouldDirty: true });
    onChange("isPublished", value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card mt="4">
        <Flex direction="column" gap="6" p="4">
          {/* Basic Info */}
          <Box>
            <Heading size="4">Basic Information</Heading>
            <Separator
              orientation="horizontal"
              my="4"
              style={{ width: "100%" }}
            />

            {/* Title */}
            <Box mb="4">
              <InputLabel required>Module Title</InputLabel>
              <TextField.Root
                {...register("title")}
                placeholder="Enter module title"
                value={watch("title")}
                onChange={(e) => {
                  setValue("title", e.target.value, { shouldDirty: true });
                  onChange("title", e.target.value);
                }}
              />
              {errors.title && <Text color="red">{errors.title.message}</Text>}
            </Box>

            <Grid columns={{ initial: "1", sm: "2" }} gap="6">
              {/* Instructor */}
              <Box>
                <InputLabel required>Instructor</InputLabel>
                <UserSearch
                  role={1}
                  value={watch("instructorId")}
                  onChange={(id) => {
                    setValue("instructorId", id, { shouldDirty: true });
                    onChange("instructorId", id);
                  }}
                  placeholder="Search instructor"
                  currentUserName={initialValues.instructor?.name}
                />
                {errors.instructorId && (
                  <Text color="red">{errors.instructorId.message}</Text>
                )}
              </Box>

              {/* Category */}
              <Box>
                <InputLabel required>Category</InputLabel>
                <CategorySearch
                  value={watch("category")}
                  onChange={(value) => {
                    setValue("category", value, { shouldDirty: true });
                    onChange("category", value);
                  }}
                  placeholder="Search category"
                />
                {errors.category && (
                  <Text color="red">{errors.category.message}</Text>
                )}
              </Box>

              {/* Language */}
              <Box>
                <InputLabel required>Language</InputLabel>
                <Select.Root
                  value={watch("language") || ""}
                  onValueChange={(value) => {
                    setValue("language", value, { shouldDirty: true });
                    onChange("language", value);
                  }}
                >
                  <Select.Trigger
                    style={{ width: "100%" }}
                    className="!cursor-pointer"
                  >
                    {watch("language")
                      ? watch("language").charAt(0).toUpperCase() +
                        watch("language").slice(1)
                      : "Select a language"}
                  </Select.Trigger>
                  <Select.Content position="popper" sideOffset={4}>
                    <Select.Item
                      value="english"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      English
                    </Select.Item>
                    <Select.Item
                      value="german"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      German
                    </Select.Item>
                    <Select.Item
                      value="romanian"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      Romanian
                    </Select.Item>
                    <Select.Item
                      value="spanish"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      Spanish
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
                {errors.language && (
                  <Text color="red">{errors.language.message}</Text>
                )}
              </Box>
              {/* <Box>
                <InputLabel required>Language</InputLabel>
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <LanguageSelector
                      value={field.value || ""}
                      onLanguageSelect={(code) => {
                        field.onChange(code);
                        onChange("language", code);
                      }}
                      width={100}
                      placeholder="Select language"
                    />
                  )}
                />
                {errors.language && (
                  <Text color="red">{errors.language.message}</Text>
                )}
              </Box> */}

              {/* Tags */}
              <Box>
                <InputLabel required>Tags</InputLabel>
                <TagSearchSelect
                  value={watch("tags") || []}
                  onChange={(tags) => {
                    setValue("tags", tags, { shouldDirty: true });
                    onChange("tags", tags);
                  }}
                />
                {errors.tags && <Text color="red">{errors.tags.message}</Text>}
              </Box>

              {/* Level */}
              <Box>
                <InputLabel required>Level</InputLabel>
                <Select.Root
                  value={watch("level") || "beginner"}
                  onValueChange={(val) => {
                    const level = val as
                      | "beginner"
                      | "intermediate"
                      | "advanced";
                    setValue("level", level, { shouldDirty: true });
                    onChange("level", level);
                  }}
                >
                  <Select.Trigger
                    style={{ width: "100%" }}
                    className="!cursor-pointer"
                  />
                  <Select.Content position="popper" sideOffset={4}>
                    <Select.Item
                      value="beginner"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      Beginner
                    </Select.Item>
                    <Select.Item
                      value="intermediate"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      Intermediate
                    </Select.Item>
                    <Select.Item
                      value="advanced"
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      Advanced
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
                {errors.level && (
                  <Text color="red">{errors.level.message}</Text>
                )}
              </Box>
            </Grid>
          </Box>

          {/* Content */}
          <Box>
            <Heading size="4">Content</Heading>
            <Separator
              orientation="horizontal"
              my="4"
              style={{ width: "100%" }}
            />

            {contentFields.map((field) => (
              <Box mb="4" key={field}>
                <InputLabel required>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </InputLabel>
                <Controller
                  control={control}
                  name={field}
                  render={({ field: f }) => (
                    <TipTapEditor
                      value={(f.value as string) || ""}
                      onChange={(val) => {
                        f.onChange(val);
                        onChange(field, val);
                      }}
                      height={field === "description" ? 200 : 150}
                    />
                  )}
                />
                {errors[field] && (
                  <Text color="red">{errors[field]?.message as string}</Text>
                )}
              </Box>
            ))}
          </Box>

          {/* Details */}
          <Box>
            <Heading size="4">Module Details</Heading>
            <Separator
              orientation="horizontal"
              my="4"
              style={{ width: "100%" }}
            />

            <Flex direction="column">
              <Grid columns={{ initial: "1", sm: "2" }} gap="6">
                {/* Price */}
                {/* <Box>
                  <InputLabel required>Price (USD)</InputLabel>
                  <TextField.Root
                    type="number"
                    step="0.01"
                    min="0"
                    value={watch("price")}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setValue("price", val, { shouldDirty: true });
                      onChange("price", val);
                    }}
                  />
                  {errors.price && (
                    <Text color="red">{errors.price.message}</Text>
                  )}
                </Box> */}
              </Grid>

              {/* Status */}
              <Box>
                <InputLabel required>Status</InputLabel>
                <RadioGroup.Root
                  value={watch("isPublished") ? "published" : "draft"}
                  onValueChange={(val) =>
                    handleStatusChange(val === "published")
                  }
                  size="2"
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

            {/* Certificate */}
            <Flex direction={{ initial: "column", sm: "row" }} gap="6" mt="6">
              <Text as="label" size="2" className="!cursor-pointer">
                <Flex as="span" gap="1" align="center">
                  <Checkbox
                    checked={watch("isCertificateAvailable")}
                    onCheckedChange={(checked) => {
                      setValue("isCertificateAvailable", !!checked, {
                        shouldDirty: true,
                      });
                      onChange("isCertificateAvailable", !!checked);
                    }}
                    color="cyan"
                    className="!cursor-pointer"
                  />
                  Certificate Available
                </Flex>
              </Text>
            </Flex>
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
            ? "Update Module"
            : "Create Module"
        }
        loading={loading}
        hasUnsavedChanges={isDirty}
      />
    </form>
  );
}
