"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Box, Card, Container, Flex, Separator, Text } from "@radix-ui/themes";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCourses } from "@/hooks/queries/useCourseQueries";
import { useCreateItem } from "@/hooks/queries/useItemQueries";
import { useLessons } from "@/hooks/queries/useLessonQueries";
import { useSections } from "@/hooks/queries/useSectionQueries";

import { CreateItemRequest } from "@/zustand/types/item";
import { Section } from "@/zustand/types/section";
import ItemForm from "../_components/ItemForm";
import FormHeader from "../../_components/form/form-header";
import FormAction from "../../_components/form/form-action";
import { InputLabel } from "../../_components/input-label";

import ModuleSearch from "../../_components/search-selector/module-searchbar";
import SectionSearch from "../../_components/search-selector/section-searchbar";
import LessonSearch from "../../_components/search-selector/lesson-searchbar";

type CourseOption = { _id: string; title: string; instructor: string };
type SectionOption = { _id: string; title: string };

export default function CreateItem() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for selected options
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    searchParams.get("courseId")
      ? {
          _id: searchParams.get("courseId") || "",
          title: "",
          instructor: "",
        }
      : null
  );

  const [selectedSection, setSelectedSection] = useState<SectionOption | null>(
    searchParams.get("sectionId")
      ? {
          _id: searchParams.get("sectionId") || "",
          title: "",
        }
      : null
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    searchParams.get("lessonId") || ""
  );

  // API hooks
  const {
    data: coursesData,
    isLoading: loadingCourses,
    error: coursesError,
  } = useCourses();

  const { data: sectionsData, isLoading: loadingSections } = useSections(
    selectedCourse?._id ? { courseId: selectedCourse._id } : undefined,
    { enabled: !!selectedCourse?._id }
  );

  const { data: lessonsData, isLoading: loadingLessons } = useLessons({
    limit: 500,
  });

  const createItem = useCreateItem({
    onSuccess: () => {
      router.back();
    },
  });

  // Data transformation
  const courses = useMemo(() => coursesData?.data || [], [coursesData]);
  const sections = useMemo(() => sectionsData?.data || [], [sectionsData]);
  const lessons = useMemo(() => lessonsData?.data || [], [lessonsData]);

  const [itemData, setItemData] = useState<
    Partial<Omit<CreateItemRequest, "lessonId">>
  >({
    title: "",
    description: "",
    type: "resource",
    content: {},
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Update module title when courses load
  useEffect(() => {
    if (selectedCourse?._id && !selectedCourse?.title && courses.length > 0) {
      const course = courses.find((c) => c._id === selectedCourse._id);
      if (course) {
        setSelectedCourse({
          _id: course._id,
          title: course.title || "",
          instructor: course.instructor?._id || "",
        });
      }
    }
  }, [courses, selectedCourse]);

  // Update section title when sections load
  useEffect(() => {
    if (
      selectedSection?._id &&
      !selectedSection?.title &&
      sections.length > 0
    ) {
      const section = sections.find(
        (s): s is Section =>
          typeof s !== "string" && s._id === selectedSection._id
      );
      if (section) {
        setSelectedSection({
          _id: section._id,
          title: section.title || "",
        });
      }
    }
  }, [sections, selectedSection]);

  // Transform sections data
  const derivedSections: SectionOption[] = useMemo(() => {
    return sections
      .filter((s): s is Section => typeof s !== "string")
      .map((s) => ({ _id: s._id, title: s.title || "" }));
  }, [sections]);

  // Derive selected lesson object for breadcrumb
  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    const lesson = lessons.find((l) => l._id === selectedLessonId);
    return lesson
      ? {
          _id: lesson._id,
          title: lesson.title || "",
        }
      : { _id: selectedLessonId, title: "" };
  }, [selectedLessonId, lessons]);

  // Form field change handler
  const handleItemDataChange = (
    field: keyof Omit<CreateItemRequest, "lessonId">,
    value: unknown
  ) => {
    if (field === "content" && value && typeof value === "object") {
      const contentValue = value as { resource?: File };

      if (contentValue.resource instanceof File) {
        setUploadedFile(contentValue.resource);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { resource, ...restContent } = contentValue;
        setItemData((prev) => ({ ...prev, [field]: restContent }));
        return;
      }
    }
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !selectedCourse ||
      !selectedSection ||
      !selectedLessonId ||
      !itemData.title?.trim()
    ) {
      toast.error(
        "Please select a module, section, lesson and provide an item title."
      );
      return;
    }

    const formData = new FormData();
    const publishFlag = itemData.isPublished === true;

    // Append basic item data
    formData.append("lessonId", selectedLessonId);
    formData.append("title", itemData.title!.trim());
    formData.append("description", itemData.description?.trim() || "");
    formData.append("type", itemData.type || "resource");
    formData.append("isPublished", String(publishFlag));

    // Handle resource type content
    if (itemData.type === "resource" && itemData.content) {
      const { mediaType } = itemData.content;

      if (mediaType === "file") {
        formData.append("fileName", itemData.content.fileName || "");
        formData.append(
          "downloadable",
          String(itemData.content?.downloadable || false)
        );

        if (uploadedFile) {
          formData.append("resource", uploadedFile);
        } else {
          console.error("No uploaded file found!");
        }
      } else if (mediaType === "link") {
        formData.append("fileName", itemData.content.fileName || "");
        formData.append("url", itemData.content.url || "");
        formData.append("mediaType", "link");
      } else if (mediaType === "text") {
        formData.append("mediaType", "text");
        formData.append("text", itemData.content.text || "");
      }
    }

    // Handle exam type content
    if (itemData.type === "exam" && itemData.content) {
      const examData: Record<string, unknown> = {
        title: itemData.content.examTitle || itemData.title,
        desc: itemData.content.examDesc || itemData.description,
        examType: itemData.content.examType || "quiz",
      };

      if (itemData.content.quizzes) {
        examData.quizzes = itemData.content.quizzes;
      }

      formData.append("exam", JSON.stringify(examData));
    }

    createItem.mutate(formData as unknown as CreateItemRequest);
  };

  // Check if all required fields are selected
  const allRequiredFieldsSelected = Boolean(
    selectedCourse && selectedSection && selectedLessonId
  );

  if (loadingCourses || loadingLessons) return <LoadingSpinner />;

  if (coursesError) {
    return (
      <Container size="4" p="6">
        <Box style={{ textAlign: "center" }}>
          <Text color="red" mb="4">
            Error loading data: {coursesError.message}
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container size="3">
      <FormHeader
        title="Create Item"
        subtitle="Add a new item with details and settings"
        course={selectedCourse}
        section={selectedSection}
        lesson={selectedLesson}
        item={null}
        activeLevel="lesson"
      />

      <form onSubmit={handleSubmit}>
        <Card className="h-full min-h-dvh">
          <Flex direction="column" gap="6" p="4">
            {/* Module Selection */}
            <Box>
              <InputLabel required>Select Module</InputLabel>
              <ModuleSearch
                value={selectedCourse?._id || ""}
                onSelectModule={(id) => {
                  const course = courses.find((c) => c._id === id);
                  setSelectedCourse({
                    _id: id,
                    title: course?.title || "",
                    instructor: course?.instructor?._id || "",
                  });
                  setSelectedSection(null);
                  setSelectedLessonId("");
                }}
                placeholder="Search or select a module..."
                currentModuleTitle={selectedCourse?.title}
                disabled={loadingCourses}
                width="100%"
              />
            </Box>

            {/* Section Selection */}
            <Box>
              <InputLabel required>Select Section</InputLabel>
              <SectionSearch
                value={selectedSection?._id || ""}
                onSelectSection={(id) => {
                  const section = derivedSections.find((s) => s._id === id);
                  setSelectedSection({ _id: id, title: section?.title || "" });
                  setSelectedLessonId("");
                }}
                placeholder={
                  !selectedCourse?._id
                    ? "Select a module first"
                    : loadingSections
                    ? "Loading sections..."
                    : "Search or select a section..."
                }
                currentSectionTitle={selectedSection?.title}
                disabled={!selectedCourse?._id || loadingSections}
                courseId={selectedCourse?._id}
                width="100%"
              />
            </Box>

            {/* Lesson Selection */}
            <Box>
              <InputLabel required>Select Lesson</InputLabel>
              <LessonSearch
                value={selectedLessonId}
                onSelectLesson={setSelectedLessonId}
                placeholder={
                  !selectedSection?._id
                    ? "Select a section first"
                    : loadingLessons
                    ? "Loading lessons..."
                    : "Search or select a lesson..."
                }
                currentLessonTitle={selectedLesson?.title}
                disabled={!selectedSection?._id || loadingLessons}
                sectionId={selectedSection?._id}
                courseId={selectedCourse?._id}
                width="100%"
              />
            </Box>

            <Separator style={{ width: "100%" }} />

            {/* Item Form - Always visible but with reduced opacity when not ready */}
            <Box
              style={{
                opacity: allRequiredFieldsSelected ? 1 : 0.5,
                pointerEvents: allRequiredFieldsSelected ? "auto" : "none",
                transition: "opacity 0.2s ease",
                cursor: allRequiredFieldsSelected ? "auto" : "not-allowed",
              }}
            >
              <Text size="4" weight="bold" my="4">
                Item Details
              </Text>
              <ItemForm
                formData={itemData}
                onChange={handleItemDataChange}
                courseTitle={selectedCourse?.title}
                sectionTitle={selectedSection?.title}
                lessonTitle={selectedLesson?.title}
              />
            </Box>
          </Flex>
        </Card>

        {/* Form Actions - Only show when all required fields are selected */}
        {allRequiredFieldsSelected && (
          <FormAction
            saveLabel={createItem.isPending ? "Creating..." : "Create Item"}
            loading={createItem.isPending || !itemData.title?.trim()}
          />
        )}
      </form>
    </Container>
  );
}
