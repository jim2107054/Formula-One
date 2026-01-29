"use client";

import { TablePagination } from "@/components/common/TablePagination";
import {
  useCourses,
  useDeepCopyCourse,
  useDeleteCourse,
} from "@/hooks/queries/useCourseQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";
import { parseFilters } from "@/util/parseFilter";
import { AlertDialog, Box, Button, Flex, Text } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ModuleHeader from "./_components/ModuleManagementHeader";
import ModuleTable from "./_components/ModuleTable";

const LEVELS = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

export default function Modules() {
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

  const { data, isLoading, isFetching, error, refetch } = useCourses(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const { mutate: deepCopyCourse, isPending: isCopying } = useDeepCopyCourse();

  const deleteModule = useDeleteCourse({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const courses = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <Box className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load modules"}
      </Box>
    );
  }

  return (
    <>
      <ModuleHeader
        fetching={isFetching}
        params={params}
        levels={LEVELS}
        handleRefresh={refetch}
        handleFilter={setFilters}
        clearFilters={resetFilters}
      />

      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <ModuleTable
          courses={courses}
          loading={isLoading}
          isCopying={isCopying}
          deepCopyCourse={deepCopyCourse}
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
          <AlertDialog.Title>Delete Module</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete &ldquo;{deleteTarget?.title}
            &rdquo;? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button
                variant="soft"
                color="gray"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteModule.isPending}
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
                  deleteTarget && deleteModule.mutate(deleteTarget.id)
                }
                disabled={deleteModule.isPending}
                className="!cursor-pointer"
              >
                {deleteModule.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
