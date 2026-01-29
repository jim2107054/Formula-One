"use client";

import { Container } from "@radix-ui/themes";
import FormHeader from "../../_components/form/form-header";
import CategoryForm, { CategoryFormValues } from "../_components/category-form";
import { useCreateCategory } from "@/hooks/queries/useCategoryQueries";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCategory() {
  const router = useRouter();
  const createCategory = useCreateCategory({
    onSuccess: () => router.push("/admin/category"),
  });

  const [formData, setFormData] = useState<CategoryFormValues>({
    title: "",
    desc: "",
    is_published: false,
  });

  return (
    <Container size="3">
      <FormHeader title="Create Category" subtitle="Add a new category" />
      <CategoryForm
        mode="create"
        initialValues={formData}
        loading={createCategory.isPending}
        onSubmit={() => createCategory.mutate(formData)}
        onChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />
    </Container>
  );
}
