"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Container } from "@radix-ui/themes";
import toast from "react-hot-toast";

import { useCourses } from "@/hooks/queries/useCourseQueries";
import { useCreateSection } from "@/hooks/queries/useSectionQueries";
import { usePagination } from "@/hooks/usePagination";

import SectionForm, { SectionFormValues } from "../_components/SectionForm";
import FormHeader from "../../_components/form/form-header";

export default function CreateSection() {
  const router = useRouter();
  const { params, setFilters } = usePagination({ defaultPageSize: 10 });
  const courseIdParam = params?.courseId;

  const { data: singleCourse } = useCourses({}, { enabled: !courseIdParam });

  const courses = useMemo(() => singleCourse?.data || [], [singleCourse]);

  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam || "");

  const selectedCourseObject = useMemo(() => {
    if (!selectedCourseId || !courses.length) return undefined;
    return courses.find((c) => c._id === selectedCourseId);
  }, [selectedCourseId, courses]);

  const createSection = useCreateSection({
    onSuccess: () => router.back(),
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to create section";

      toast.error(message);
    },
  });

  const handleModuleSelect = (id: string) => {
    setSelectedCourseId(id);
    setFilters({ courseId: id });
  };

  const handleSubmit = (data: SectionFormValues) => {
    if (!selectedCourseId) {
      toast.error("Please select a module first");
      return;
    }
    createSection.mutate({ courseId: selectedCourseId, data });
  };

  return (
    <Container size="3">
      <FormHeader
        title="Create Section"
        subtitle="Add a new section with details and settings"
        course={selectedCourseObject}
        activeLevel="course"
      />
      <SectionForm
        mode="create"
        selectedCourseId={selectedCourseId}
        onCourseChange={handleModuleSelect}
        courseOptions={courses.map((c) => ({ id: c._id, title: c.title }))}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}
