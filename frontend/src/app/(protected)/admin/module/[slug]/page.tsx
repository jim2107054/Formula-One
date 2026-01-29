"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  useCourseBySlug,
  useUpdateCourse,
} from "@/hooks/queries/useCourseQueries";
import type { CreateCourseRequest } from "@/zustand/types/course";
import { Container, Flex, Text } from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";
import ModuleForm from "../_components/ModuleForm";
import FormHeader from "../../_components/form/form-header";

export default function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const {
    data: currentCourse,
    isLoading,
    error,
    refetch,
  } = useCourseBySlug(slug);

  const updateCourse = useUpdateCourse({
    onSuccess: () => router.push("/admin/module"),
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !currentCourse) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Text color="red" mb="4">
          {error instanceof Error ? error.message : "Module not found"}
        </Text>
        <button onClick={() => refetch()}>Retry</button>
      </Flex>
    );
  }

  const initialValues: Partial<CreateCourseRequest> = {
    title: currentCourse.title,
    description: currentCourse.description,
    level: currentCourse.level,
    // price: currentCourse.price,
    category: currentCourse.category,
    features: currentCourse.features,
    requirements: currentCourse.requirements,
    whatYouWillLearn: currentCourse.whatYouWillLearn,
    language: currentCourse.language,
    isPublished: currentCourse.isPublished,
    tags: currentCourse.tags ?? [],
    instructorId:
      typeof currentCourse.instructorId === "string"
        ? currentCourse.instructorId
        : currentCourse.instructorId,
    isCertificateAvailable: currentCourse.isCertificateAvailable,
  };

  return (
    <Container size="3">
      <FormHeader
        title="Edit Module"
        subtitle="Update module details and settings"
      />

      <ModuleForm
        mode="edit"
        initialValues={initialValues}
        loading={updateCourse.isPending}
        onSubmit={(data) =>
          updateCourse.mutate({
            id: currentCourse._id,
            data,
          })
        }
        onChange={() => {}}
      />
    </Container>
  );
}
