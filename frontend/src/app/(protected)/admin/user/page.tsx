"use client";

import { Box, Text } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useDeleteUser, useUsers } from "@/hooks/queries/useUserQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";

import { TablePagination } from "@/components/common/TablePagination";
import { parseFilters } from "@/util/parseFilter";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import UserManagementHeader from "./_components/user-management-header";
import UserTable from "./_components/user-table";

export default function UserManagement() {
  const searchParams = useSearchParams();
  const { params, setFilters, setPage, setPageSize, resetFilters } =
    usePagination({ defaultPageSize: 10 });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10) as PageSize;

  const filters = useMemo(
    () => parseFilters(searchParams, { page, limit }),
    [searchParams, page, limit]
  );

  const { data, isLoading, isFetching, error, refetch } = useUsers(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const users = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <Box className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load users"}
      </Box>
    );
  }

  return (
    <>
      <UserManagementHeader
        fetching={isFetching}
        currentParams={params}
        clearFilters={resetFilters}
        handleFilter={setFilters}
        handleRefresh={refetch}
      />
      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <UserTable
          users={users}
          loading={isLoading}
          onDeleteDialog={(id, name) => setDeleteTarget({ id, name })}
        />
      </Box>
      <TablePagination
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <DeleteUserDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        userToDelete={deleteTarget}
        onConfirm={() => deleteTarget && deleteUser.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteUser.isPending}
      />
    </>
  );
}
