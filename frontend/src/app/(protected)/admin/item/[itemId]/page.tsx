"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCourses } from "@/hooks/queries/useCourseQueries";
import { useItem, useUpdateItem } from "@/hooks/queries/useItemQueries";
import { useLessons } from "@/hooks/queries/useLessonQueries";
import { useSections } from "@/hooks/queries/useSectionQueries";
import type { ItemContent, UpdateItemRequest } from "@/zustand/types/item";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/app/(protected)/admin/_components/button";
import { Box, Card, Container, Flex, Text } from "@radix-ui/themes";
import FormHeader from "../../_components/form/form-header";
import ItemForm from "../_components/ItemForm";

import ModuleSearch from "../../_components/search-selector/module-searchbar";
import SectionSearch from "../../_components/search-selector/section-searchbar";
import LessonSearch from "../../_components/search-selector/lesson-searchbar";
import { InputLabel } from "../../_components/input-label";
import FormAction from "../../_components/form/form-action";

export default function ItemDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = params.itemId as string;
  const isEditMode = searchParams.get("edit") === "true";

  const courseIdFromUrl = searchParams.get("courseId") || "";
  const sectionIdFromUrl = searchParams.get("sectionId") || "";
  const lessonIdFromUrl = searchParams.get("lessonId") || "";

  const {
    data: currentItem,
    isLoading: loadingItem,
    error: itemError,
  } = useItem(itemId);
  const { data: coursesData, isLoading: loadingCourses } = useCourses({
    limit: 500,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseIdFromUrl || ""
  );
  const { data: sectionsData } = useSections(
    selectedCourseId ? { courseId: selectedCourseId } : undefined,
    { enabled: !!selectedCourseId }
  );
  const { data: lessonsData, isLoading: loadingLessons } = useLessons({
    limit: 500,
  });
  const updateItem = useUpdateItem({
    onSuccess: () => {
      setIsEditing(false);
      router.back();
    },
  });

  const courses = useMemo(() => coursesData?.data || [], [coursesData]);
  const sections = useMemo(() => sectionsData?.data || [], [sectionsData]);
  const lessons = useMemo(() => lessonsData?.data || [], [lessonsData]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sectionIdFromUrl || ""
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    lessonIdFromUrl || ""
  );
  const [editForm, setEditForm] = useState<UpdateItemRequest>({
    title: "",
    description: "",
    type: "resource",
    content: {
      mediaType: "text",
      text: "",
    },
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleEditFormChange = (
    field: keyof UpdateItemRequest,
    value: unknown
  ) => {
    if (field === "content" && value && typeof value === "object") {
      const contentValue = value as { resource?: File };
      if (contentValue.resource instanceof File) {
        setUploadedFile(contentValue.resource);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { resource, ...restContent } = contentValue;
        setEditForm((prev) => ({ ...prev, [field]: restContent }));
        return;
      }
    }
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
  const [isEditing, setIsEditing] = useState(isEditMode);

  // Get course title for display
  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  // Get section title for display
  const selectedSection = useMemo(
    () => sections.find((s) => s._id === selectedSectionId),
    [sections, selectedSectionId]
  );

  // Get lesson title for display
  const selectedLesson = useMemo(
    () => lessons.find((l) => l._id === selectedLessonId),
    [lessons, selectedLessonId]
  );

  // Auto-populate course from URL or current item
  useEffect(() => {
    if (!currentItem) return;
    if (!courseIdFromUrl && !selectedCourseId) {
      const courseId =
        typeof currentItem.courseId === "string"
          ? currentItem.courseId
          : currentItem.courseId?._id ?? "";
      if (courseId) {
        setSelectedCourseId(courseId);
      }
    }
  }, [currentItem, courseIdFromUrl, selectedCourseId]);

  // Auto-populate section from URL or current item
  useEffect(() => {
    if (!currentItem || !selectedCourseId) return;
    if (!sectionIdFromUrl && !selectedSectionId) {
      const sectionId =
        typeof currentItem.sectionId === "string"
          ? currentItem.sectionId
          : currentItem.sectionId?._id ?? "";
      if (sectionId) {
        setSelectedSectionId(sectionId);
      }
    }
  }, [currentItem, sectionIdFromUrl, selectedSectionId, selectedCourseId]);

  // Auto-populate lesson from URL or current item
  useEffect(() => {
    if (!currentItem) return;
    if (!lessonIdFromUrl && !selectedLessonId) {
      const lessonId =
        typeof currentItem.lessonId === "string"
          ? currentItem.lessonId
          : currentItem.lessonId?._id ?? "";
      if (lessonId) {
        setSelectedLessonId(lessonId);
      }
    }
  }, [currentItem, lessonIdFromUrl, selectedLessonId]);

  // Populate edit form with current item data
  useEffect(() => {
    if (!currentItem) return;

    let itemContent: Partial<ItemContent> | undefined;

    if (currentItem.type === "exam" && currentItem.contentSummary?.exam) {
      const exam = currentItem.contentSummary.exam as {
        title?: string;
        desc?: string;
        examType?: string;
        quizzes?: unknown[];
      };
      itemContent = {
        examTitle: exam.title || currentItem.title,
        examDesc: exam.desc || currentItem.description,
        examType: (exam.examType as "quiz" | "assignment") || "quiz",
        quizzes: exam.quizzes || [],
      };
    } else if (currentItem.type === "resource" && currentItem.contentSummary) {
      itemContent = {
        mediaType: currentItem.contentSummary.mediaType,
        fileName: currentItem.contentSummary.fileName,
        url: currentItem.contentSummary.url,
        downloadable: currentItem.contentSummary.downloadable,
      };

      if (currentItem.contentSummary.mediaType === "text") {
        itemContent.text =
          (typeof currentItem.content === "string"
            ? currentItem.content
            : null) ||
          currentItem.contentSummary.text ||
          (typeof currentItem.content === "object"
            ? currentItem.content?.text
            : null) ||
          "";
      }
    } else if (typeof currentItem.content === "string") {
      itemContent = { text: currentItem.content };
    } else {
      itemContent = currentItem.content;
    }

    setEditForm({
      title: currentItem.title,
      description: currentItem.description,
      type: currentItem.type,
      estimatedDuration: currentItem.estimatedDuration,
      isPublished: currentItem.isPublished,
      content: itemContent,
    });
  }, [currentItem]);

  const handleSave = async () => {
    if (!currentItem) return;

    if (!selectedLessonId || !editForm.title?.trim()) {
      toast.error("Please select a lesson and provide an item title.");
      return;
    }

    const formData = new FormData();
    formData.append("lessonId", selectedLessonId);
    formData.append("title", editForm.title!.trim());
    formData.append("description", editForm.description?.trim() || "");
    formData.append("type", editForm.type || "resource");

    const publishFlag = editForm.isPublished === true;
    formData.append("isPublished", String(publishFlag));

    if (editForm.type === "resource" && editForm.content) {
      const content = editForm.content as unknown as {
        mediaType?: string;
        fileName?: string;
        downloadable?: boolean;
        url?: string;
        text?: string;
      };

      const mediaType = content.mediaType;

      if (mediaType === "file") {
        formData.append("fileName", content.fileName || "");
        formData.append("downloadable", String(content.downloadable || false));
        if (uploadedFile) {
          formData.append("resource", uploadedFile);
        }
      } else if (mediaType === "link") {
        formData.append("fileName", content.fileName || "");
        formData.append("url", content.url || "");
        formData.append("mediaType", "link");
      } else if (mediaType === "text") {
        formData.append("mediaType", "text");
        formData.append("text", content.text || "");
      }
    }

    if (editForm.type === "exam" && editForm.content) {
      const content = editForm.content as unknown as {
        examTitle?: string;
        examDesc?: string;
        examType?: string;
        quizzes?: unknown[];
      };

      const examData: Record<string, unknown> = {
        title: content.examTitle || editForm.title,
        desc: content.examDesc || editForm.description,
        examType: content.examType || "quiz",
      };

      if (content.quizzes) {
        examData.quizzes = content.quizzes;
      }

      formData.append("exam", JSON.stringify(examData));
    }

    updateItem.mutate({
      id: currentItem._id,
      data: formData as unknown as UpdateItemRequest,
    });
  };

  if (loadingItem || loadingCourses || loadingLessons)
    return <LoadingSpinner />;

  if (itemError)
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh", width: "100%" }}
      >
        <Text color="red" mb="4">
          Error loading item: {itemError.message}
        </Text>
        <Link href="/admin/item">
          <Button>Back to Items</Button>
        </Link>
      </Flex>
    );

  if (!currentItem)
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh", width: "100%" }}
      >
        <Box style={{ textAlign: "center" }}>
          <Text color="gray" mb="4">
            Item not found
          </Text>
          <Link href="/admin/item">
            <Button>Back to Items</Button>
          </Link>
        </Box>
      </Flex>
    );

  return (
    <Container size="3">
      <FormHeader
        title={isEditing ? "Edit Item" : "Item Details"}
        subtitle={
          isEditing
            ? "Update item details and settings"
            : "View item details and settings"
        }
        course={selectedCourse}
        section={selectedSection}
        lesson={selectedLesson}
        item={currentItem}
        activeLevel={"item"}
      />

      <Box position="relative">
        {isEditing && (
          <Box>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Card>
                <Flex direction="column" gap="6" p="4">
                  {/* Module Search Bar - READ ONLY in edit mode */}
                  <Box>
                    <InputLabel
                      required
                      tooltip="Module cannot be changed when editing an item"
                      justify="start"
                    >
                      Module
                    </InputLabel>
                    <ModuleSearch
                      value={selectedCourseId}
                      onSelectModule={() => {}}
                      placeholder="Module (cannot be changed)"
                      currentModuleTitle={selectedCourse?.title}
                      disabled={true}
                      width="100%"
                    />
                  </Box>

                  {/* Section Search Bar - READ ONLY in edit mode */}
                  <Box>
                    <InputLabel
                      required
                      tooltip="Section cannot be changed when editing an item"
                      justify="start"
                    >
                      Section
                    </InputLabel>
                    <SectionSearch
                      value={selectedSectionId}
                      onSelectSection={() => {}}
                      placeholder="Section (cannot be changed)"
                      currentSectionTitle={selectedSection?.title}
                      disabled={true}
                      courseId={selectedCourseId}
                      width="100%"
                    />
                  </Box>

                  {/* Lesson Search Bar - READ ONLY in edit mode */}
                  <Box>
                    <InputLabel
                      required
                      tooltip="Lesson cannot be changed when editing an item"
                      justify="start"
                    >
                      Lesson
                    </InputLabel>
                    <LessonSearch
                      value={selectedLessonId}
                      onSelectLesson={() => {}}
                      placeholder="Lesson (cannot be changed)"
                      currentLessonTitle={selectedLesson?.title}
                      disabled={true}
                      sectionId={selectedSectionId}
                      courseId={selectedCourseId}
                      width="100%"
                    />
                  </Box>

                  <hr className="h-px bg-gray-300 border-0" />

                  {selectedLessonId && (
                    <Box>
                      <Text size="4" weight="bold" mb="4">
                        Item Details
                      </Text>
                      <ItemForm
                        formData={editForm}
                        onChange={handleEditFormChange}
                        courseTitle={selectedCourse?.title}
                        sectionTitle={selectedSection?.title}
                        lessonTitle={selectedLesson?.title}
                      />
                    </Box>
                  )}

                  {/* {selectedLessonId && (
                    <Box mt="6">
                      <Flex gap="3" justify="end">
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="light"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            updateItem.isPending || !editForm.title?.trim()
                          }
                        >
                          <BiSave className="mr-2" />
                          {updateItem.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </Flex>
                    </Box>
                  )} */}
                </Flex>
              </Card>

              <FormAction
                saveLabel={updateItem.isPending ? "Saving..." : "Save Changes"}
                loading={updateItem.isPending || !editForm.title?.trim()}
              />
            </form>
          </Box>
        )}
      </Box>
    </Container>
  );
}
