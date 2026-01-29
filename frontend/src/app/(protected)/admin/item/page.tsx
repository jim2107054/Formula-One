"use client";

import {
  AlertDialog,
  Box,
  Flex,
  Button as RadixButton,
  Text,
} from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { TablePagination } from "@/components/common/TablePagination";
import { useDeleteItem, useItems } from "@/hooks/queries/useItemQueries";
import { PageSize, usePagination } from "@/hooks/usePagination";
import { parseFilters } from "@/util/parseFilter";
import ItemManagementHeader from "./_components/ItemManagementHeader";
import ItemTable from "./_components/ItemTable";

export default function ItemsManagement() {
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

  const { data, isLoading, isFetching, error, refetch } = useItems(filters, {
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const deleteItem = useDeleteItem({
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const items = data?.data || [];
  const { totalItems = 0, totalPages = 1 } = data?.pagination || {};

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 text-center p-4 rounded-md">
        {error instanceof Error ? error.message : "Failed to load items"}
      </div>
    );
  }

  return (
    <>
      <ItemManagementHeader
        fetching={isFetching}
        params={params}
        searchParams={searchParams}
        handleFilter={setFilters}
        clearFilters={resetFilters}
        handleRefresh={refetch}
      />

      <Box className="mt-6">
        <Text size="1" weight="medium">
          Page {page} of {totalPages} | Showing {limit} of {totalItems} results
        </Text>
        <ItemTable
          items={items}
          loading={isLoading}
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
          <AlertDialog.Title>Delete Item</AlertDialog.Title>
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
                disabled={deleteItem.isPending}
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
                  deleteTarget && deleteItem.mutate(deleteTarget.id)
                }
                disabled={deleteItem.isPending}
                className="!cursor-pointer"
              >
                {deleteItem.isPending ? "Deleting..." : "Delete"}
              </RadixButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
