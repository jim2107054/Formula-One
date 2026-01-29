"use client";

import { useParams, useRouter } from "next/navigation";
import { Container } from "@radix-ui/themes";

import { useTag, useUpdateTag } from "@/hooks/queries/useTagQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TagForm, { TagFormValues } from "../_components/tag-form";
import FormHeader from "../../_components/form/form-header";

export default function EditTagPage() {
  const router = useRouter();
  const { tagId } = useParams() as { tagId: string };
  const { data: currentTag, isLoading } = useTag(tagId);
  const updateTag = useUpdateTag({
    onSuccess: () => router.push("/admin/tag"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!currentTag) return <div>Tag not found</div>;

  const handleSubmit = (data: TagFormValues) => {
    updateTag.mutate({ id: tagId, data });
  };

  return (
    <Container size="3">
      <FormHeader title="Edit Tag" subtitle="Update tag details" />
      <TagForm
        mode="edit"
        initialValues={currentTag}
        onSubmit={handleSubmit}
        loading={updateTag.isPending}
      />
    </Container>
  );
}
