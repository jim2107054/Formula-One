"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertDialog,
  Box,
  Flex,
  Button as RadixButton,
  Text,
} from "@radix-ui/themes";

import { useDeleteLesson, useLessons } from "@/hooks/queries/useLessonQueries";
import { useSections } from "@/hooks/queries/useSectionQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";
import { parseFilters } from "@/util/parseFilter";

import { TablePagination } from "@/components/common/TablePagination";
import LessonManagementHeader from "./_components/LessonManagementHeader";
import LessonTable from "./_components/LessonTable";

export default function LessonsManagement() {
  const searchParams = useSearchParams();
  const { params, setFilters, setPage, setPageSize, resetFilters } =
    usePagination({ defaultPageSize: 10 });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10) as PageSize;

  const filters = useMemo(
    () => parseFilters(searchParams, { page, limit }),
    [searchParams, page, limit]
  );

  const { data: sectionsData } = useSections({}, { staleTime: 5 * 60 * 1000 });

  const { data, isLoading, isFetching, error, refetch } = useLessons(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const deleteLesson = useDeleteLesson({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const lessons = data?.data || [];
  const sections = sectionsData?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <Box className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load lessons"}
      </Box>
    );
  }

  return (
    <>
      <LessonManagementHeader
        fetching={isFetching}
        params={params}
        handleRefresh={refetch}
        handleFilter={setFilters}
        resetFilters={resetFilters}
      />

      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <LessonTable
          lessons={lessons}
          sections={sections}
          loading={isLoading}
          params={params}
          onDelete={(id, title) => setDeleteTarget({ id, title })}
        />
      </Box>

      <TablePagination
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <AlertDialog.Root
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete Lesson</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete &ldquo;{deleteTarget?.title}
            &rdquo;? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <RadixButton
                variant="soft"
                color="gray"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLesson.isPending}
                className="!cursor-pointer"
              >
                Cancel
              </RadixButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <RadixButton
                variant="solid"
                color="red"
                onClick={() =>
                  deleteTarget && deleteLesson.mutate(deleteTarget.id)
                }
                disabled={deleteLesson.isPending}
                className="!cursor-pointer"
              >
                {deleteLesson.isPending ? "Deleting..." : "Delete"}
              </RadixButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
