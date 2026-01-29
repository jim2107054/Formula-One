"use client";

import { TablePagination } from "@/components/common/TablePagination";
import {
  useDeleteEnrollment,
  useEnrollments,
} from "@/hooks/queries/useEnrollmentQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";
import { parseFilters } from "@/util/parseFilter";
import {
  AlertDialog,
  Box,
  Flex,
  Button as RadixButton,
  Text,
} from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import EnrollManagementHeader from "./_components/EnrollManagementHeader";
import EnrollTable from "./_components/EnrollTable";

export default function EnrollManagement() {
  const searchParams = useSearchParams();
  const { params, setFilters, setPage, setPageSize, resetFilters } =
    usePagination({ defaultPageSize: 10 });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10) as PageSize;

  const filters = useMemo(
    () => parseFilters(searchParams, { page, limit }),
    [searchParams, page, limit]
  );

  const { data, isLoading, isFetching, error, refetch } = useEnrollments(
    filters,
    {
      placeholderData: (prev) => prev,
      refetchOnMount: true,
    }
  );

  const deleteEnrollment = useDeleteEnrollment({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const enrolls = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load enrollments"}
      </div>
    );
  }

  return (
    <>
      <EnrollManagementHeader
        fetching={isFetching}
        params={params}
        handleFilter={setFilters}
        handleRefresh={refetch}
        clearFilters={resetFilters}
      />

      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <EnrollTable
          enrolls={enrolls || []}
          loading={isLoading}
          onDeleteDialog={(id: string, label?: string) =>
            setDeleteTarget({ id, label: label || "this enrollment" })
          }
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
          <AlertDialog.Title>Delete Enrollment</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.label}</strong>? This action cannot be
            undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <RadixButton
                variant="soft"
                color="gray"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteEnrollment.isPending}
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
                  deleteTarget && deleteEnrollment.mutate(deleteTarget.id)
                }
                disabled={deleteEnrollment.isPending}
                className="!cursor-pointer"
              >
                {deleteEnrollment.isPending ? "Deleting..." : "Delete"}
              </RadixButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
