"use client";

import { Box, Text } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useDeleteTag, useTags } from "@/hooks/queries/useTagQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";

import { TablePagination } from "@/components/common/TablePagination";
import { parseFilters } from "@/util/parseFilter";
import { DeleteTagDialog } from "./_components/DeleteTagDialog";
import TagManagementHeader from "./_components/TagManagementHeader";
import TagTable from "./_components/TagTable";

export default function TagsManagement() {
  const searchParams = useSearchParams();
  const { params, setFilters, setPage, setPageSize, resetFilters } =
    usePagination({ defaultPageSize: 10 });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10) as PageSize;

  const filters = useMemo(() => {
    const parsed = parseFilters(searchParams, { page, limit }) as Record<
      string,
      unknown
    >;

    if (parsed.status && typeof parsed.status === "string") {
      const normalized = parsed.status.toLowerCase();
      if (normalized === "draft") {
        parsed.is_published = false;
      } else if (normalized === "publish" || normalized === "published") {
        parsed.is_published = true;
      }
      delete parsed.status;
    }

    return parsed as { page: number; limit: number } & Record<string, unknown>;
  }, [searchParams, page, limit]);

  const { data, isLoading, isFetching, error, refetch } = useTags(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const deleteTag = useDeleteTag({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const tags = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};
  if (error) {
    return (
      <Box className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load tags"}
      </Box>
    );
  }

  return (
    <>
      <TagManagementHeader
        fetching={isFetching}
        params={params}
        handleRefresh={refetch}
        handleFilter={setFilters}
        clearFilters={resetFilters}
      />

      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <TagTable
          tags={tags}
          loading={isLoading}
          onDeleteDialog={(id, title) => setDeleteTarget({ id, title })}
        />
      </Box>

      <TablePagination
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <DeleteTagDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tagToDelete={
          deleteTarget
            ? { id: deleteTarget.id, title: deleteTarget.title }
            : null
        }
        onConfirm={() => deleteTarget && deleteTag.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteTag.isPending}
      />
    </>
  );
}
