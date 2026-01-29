"use client";

import { useRouter } from "next/navigation";
import { Container } from "@radix-ui/themes";

import { useCreateTag } from "@/hooks/queries/useTagQueries";
import TagForm, { TagFormValues } from "../_components/tag-form";
import FormHeader from "../../_components/form/form-header";

export default function CreateTagPage() {
  const router = useRouter();
  const createTag = useCreateTag({
    onSuccess: () => router.push("/admin/tag"),
  });

  const handleSubmit = (data: TagFormValues) => {
    createTag.mutate(data);
  };

  return (
    <Container size="3">
      <FormHeader title="Create Tag" subtitle="Add a new tag" />
      <TagForm
        mode="create"
        onSubmit={handleSubmit}
        loading={createTag.isPending}
      />
    </Container>
  );
}
