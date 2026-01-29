"use client";

import { Box, Text } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/queries/useCategoryQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";

import { TablePagination } from "@/components/common/TablePagination";
import { parseFilters } from "@/util/parseFilter";
import { CategoryManagementHeader } from "./_components";
import CategoryTable from "./_components/CategoryTable";
import { DeleteCategoryDialog } from "./_components/DeleteCategoryDialog";

export default function CategoryManagement() {
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

  const { data, isLoading, isFetching, error, refetch } = useCategories(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const deleteCategory = useDeleteCategory({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const categories = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <Box className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load categories"}
      </Box>
    );
  }

  return (
    <>
      <CategoryManagementHeader
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
        <CategoryTable
          categories={categories}
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

      <DeleteCategoryDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        categoryToDelete={
          deleteTarget
            ? { _id: deleteTarget.id, title: deleteTarget.title }
            : null
        }
        onConfirm={() => deleteTarget && deleteCategory.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteCategory.isPending}
      />
    </>
  );
}
