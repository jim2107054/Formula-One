"use client";

import { AlertDialog, Box, Button, Flex, Text } from "@radix-ui/themes";
import { useMemo, useState } from "react";

import { TablePagination } from "@/components/common/TablePagination";
import SectionManagementHeader from "./_components/SectionManagementHeader";
import SectionTable from "./_components/SectionTable";

import {
  useDeleteSection,
  useSections,
} from "@/hooks/queries/useSectionQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";

export default function SectionsManagement() {
  const { params, setFilters, resetFilters, setPage, setPageSize } =
    usePagination({ defaultPageSize: 10 });
  const courseId = params.courseId as string | undefined;
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10) as PageSize;

  const filters = {
    ...params,
    courseId: params.courseId || undefined,
  };

  const {
    data: allSections,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSections(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const deleteSection = useDeleteSection({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const totalSections = useMemo(() => {
    if (courseId) {
      return allSections?.data?.length ?? 0;
    }
    return allSections?.pagination?.totalItems ?? 0;
  }, [courseId, allSections]);

  const sectionsLoading = courseId ? !allSections : isLoading;

  const totalPages = Math.max(1, Math.ceil(totalSections / limit));
  const ERROR_STYLES = "bg-red-100 text-red-700 text-center";

  return (
    <>
      <SectionManagementHeader
        fetching={isFetching}
        params={params}
        handleRefresh={refetch}
        handleFilter={setFilters}
        clearFilters={resetFilters}
      />
      <Box className="mt-6">
        {error ? (
          <div className={ERROR_STYLES}>{error.message}</div>
        ) : (
          <>
            <Text size="1" weight="medium">
              Page {page} of {totalPages} | Showing {limit} of {totalSections}{" "}
              results
            </Text>
            <SectionTable
              sections={allSections?.data || []}
              loading={sectionsLoading}
              params={params}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          </>
        )}
      </Box>
      <TablePagination
        totalItems={totalSections}
        itemsPerPage={limit}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <AlertDialog.Root
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete Section</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete “{deleteTarget?.title}”? This action
            cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" onClick={closeDeleteDialog}
                className="!cursor-pointer"
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={() =>
                  deleteTarget && deleteSection.mutate(deleteTarget.id)
                }
                disabled={deleteSection.isPending}
                className="!cursor-pointer"
              >
                {deleteSection.isPending ? "Deleting..." : "Delete Section"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
