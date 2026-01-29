"use client";

import { useCreateCourse } from "@/hooks/queries/useCourseQueries";
import { CreateCourseRequest } from "@/zustand/types/course";
import { Container } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ModuleForm from "../_components/ModuleForm";
import FormHeader from "../../_components/form/form-header";

export default function CreateCourse() {
  const router = useRouter();

  const createCourse = useCreateCourse({
    onSuccess: () => {
      router.push("/admin/module");
    },
  });

  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: "",
    description: "",
    level: "beginner",
    // price: 0,
    category: "",
    tags: [],
    features: "",
    requirements: "",
    whatYouWillLearn: "",
    language: "English",
    instructorId: "",
    isPublished: false,
    isCertificateAvailable: false,
  });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      requirements: Array.isArray(formData.requirements)
        ? formData.requirements.join("\n")
        : formData.requirements,
      whatYouWillLearn: Array.isArray(formData.whatYouWillLearn)
        ? formData.whatYouWillLearn.join("\n")
        : formData.whatYouWillLearn,
    };

    createCourse.mutate(payload);
  };

  return (
    <Container size="3">
      <FormHeader
        title="Create New Module"
        subtitle="Add a new module with info & content"
      />
      <ModuleForm
        mode="create"
        initialValues={formData}
        loading={createCourse.isPending}
        onSubmit={handleSubmit}
        onChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />
    </Container>
  );
}
