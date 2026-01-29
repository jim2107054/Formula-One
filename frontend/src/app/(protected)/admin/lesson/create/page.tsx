"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Container, Text } from "@radix-ui/themes";

import LessonForm, { LessonFormValues } from "../_components/LessonForm";
import FormHeader from "../../_components/form/form-header";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { useCourse, useCourses } from "@/hooks/queries/useCourseQueries";
import { useSections } from "@/hooks/queries/useSectionQueries";
import { useCreateLesson } from "@/hooks/queries/useLessonQueries";
import { usePagination } from "@/hooks/usePagination";

export default function CreateLesson() {
  const router = useRouter();
  const { params } = usePagination({ defaultPageSize: 10 });
  console.log("Create Lesson Params:", params);
  const courseIdParam = params?.courseId;
  const sectionIdParam = params?.sectionId;

  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam || "");
  const [selectedSectionId, setSelectedSectionId] = useState(
    sectionIdParam || ""
  );

  // Queries
  const { data: singleCourse, isLoading: singleLoading } =
    useCourse(courseIdParam);
  const {
    data: allCourses,
    isLoading: allCoursesLoading,
    error: coursesError,
  } = useCourses({}, { enabled: !courseIdParam });
  const { data: sectionsData } = useSections(
    { courseId: selectedCourseId },
    { enabled: !!selectedCourseId, staleTime: 5 * 60 * 1000 }
  );

  // Find the actual course and section objects (not just IDs)
  const selectedCourseObject = useMemo(() => {
    if (singleCourse) return singleCourse;
    if (selectedCourseId && allCourses?.data) {
      return allCourses.data.find((c) => c._id === selectedCourseId);
    }
    return undefined;
  }, [singleCourse, selectedCourseId, allCourses?.data]);

  const selectedSectionObject = useMemo(() => {
    if (selectedSectionId && sectionsData?.data) {
      return sectionsData.data.find((s) => s._id === selectedSectionId);
    }
    return undefined;
  }, [selectedSectionId, sectionsData?.data]);

  const courseOptions = useMemo(
    () =>
      singleCourse
        ? [{ id: singleCourse._id, title: singleCourse.title }]
        : allCourses?.data?.map((c) => ({ id: c._id, title: c.title })) ?? [],
    [singleCourse, allCourses]
  );
  const sectionOptions = useMemo(
    () => sectionsData?.data?.map((s) => ({ id: s._id, title: s.title })) ?? [],
    [sectionsData?.data]
  );

  useEffect(() => {
    if (!sectionIdParam || !sectionsData?.data?.length) return;

    const exists = sectionsData.data.some((s) => s._id === sectionIdParam);
    if (exists) setSelectedSectionId(sectionIdParam);
  }, [sectionIdParam, sectionsData]);

  const createLesson = useCreateLesson({
    onSuccess: () => router.back(),
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to create lesson";

      toast.error(message);
    },
  });

  const handleSubmit = (data: LessonFormValues) => {
    if (!selectedSectionId || !data.title?.trim()) {
      toast.error("Please select a section and provide a lesson title.");
      return;
    }

    createLesson.mutate({
      courseId: selectedCourseId,
      sectionId: selectedSectionId,
      title: data.title.trim(),
      description: data.description?.trim(),
      isPublished: data.isPublished,
    });
  };

  if ((allCoursesLoading && !singleCourse) || !sectionOptions)
    return <LoadingSpinner />;
  if (coursesError) return <Text color="red">Error loading modules</Text>;

  return (
    <Container size="3">
      <FormHeader
        title="Create Lesson"
        subtitle="Add a new lesson with details and settings"
        course={selectedCourseObject} 
        section={selectedSectionObject} 
        activeLevel="section" 
      />
      <LessonForm
        mode="create"
        loading={createLesson.isPending}
        onSubmit={handleSubmit}
        selectedCourseId={selectedCourseId}
        selectedSectionId={selectedSectionId}
        onCourseChange={setSelectedCourseId}
        onSectionChange={setSelectedSectionId}
        courseOptions={courseOptions}
        sectionOptions={sectionOptions}
        loadingCourses={singleLoading || allCoursesLoading}
        loadingSections={!selectedCourseId || sectionOptions.length === 0}
      />
    </Container>
  );
}