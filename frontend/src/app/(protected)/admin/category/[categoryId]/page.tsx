"use client";

import { Container } from "@radix-ui/themes";
import FormHeader from "../../_components/form/form-header";
import CategoryForm, { CategoryFormValues } from "../_components/category-form";
import {
  useCategory,
  useUpdateCategory,
} from "@/hooks/queries/useCategoryQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const { data, isLoading } = useCategory(categoryId);
  const updateCategory = useUpdateCategory({
    onSuccess: () => router.push("/admin/category"),
  });

  const [formData, setFormData] = useState<CategoryFormValues>({
    title: "",
    desc: "",
    is_published: false,
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p>Category not found</p>;

  return (
    <Container size="3">
      <FormHeader title="Edit Category" subtitle="Update category details" />
      <CategoryForm
        mode="edit"
        initialValues={formData}
        loading={updateCategory.isPending}
        onSubmit={() =>
          updateCategory.mutate({ id: categoryId, data: formData })
        }
        onChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />
    </Container>
  );
}
