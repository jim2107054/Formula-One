"use client";

import { useState } from "react";
import { BiDotsVertical, BiPlus } from "react-icons/bi";
import {
  AlertDialog,
  Box,
  Button as RadixButton,
  Container,
  DropdownMenu,
  Flex,
  Table,
  Text,
} from "@radix-ui/themes";

import { Cms } from "@/zustand/types/cms";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TablePagination } from "@/components/common/TablePagination";
import { useAllCms, useDeleteCms } from "@/hooks/queries/useCmsQueries";
import { usePagination } from "@/hooks/usePagination";
import PageHeader from "../_components/page-header";
import { MdEditSquare } from "react-icons/md";
import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";

export default function CmsListPage() {
  const { params, setPage, setPageSize } = usePagination();
  const currentPage = parseInt(params.page as string) || 1;
  const pageSize =
    (parseInt(params.limit as string) as 10 | 20 | 50 | 100) || 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cmsData, isLoading } = useAllCms({
    page: currentPage,
    limit: pageSize,
  });

  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/user");

  // const deleteHandler = (id: string, name: string) => {
  //   handleInteraction(id);
  // };

  const deleteCms = useDeleteCms({
    onSuccess: () => {
      setDeleteId(null);
    },
  });

  const cmsList = cmsData?.data || [];
  const totalPages = cmsData?.pagination?.totalPages || 1;
  const totalItems = cmsData?.pagination?.totalItems || 0;

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCms.mutate(deleteId);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container size="4">
      <PageHeader
        title="CMS Management"
        subtitle="Manage all CMS contents"
        actionHref="/admin/cms/create"
        actionText="Create CMS Content"
        actionIcon={<BiPlus />}
      />

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Public</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Last Updated</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {cmsList.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <Text color="gray" align="center">
                  No CMS content found
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            cmsList.map((cms: Cms) => (
              <InteractiveTableRow
                key={cms.key}
                isLastInteracted={isLastInteracted(cms.key)}
              >
                <Table.Cell>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <RadixButton
                        variant="ghost"
                        className="!text-accent !cursor-pointer"
                      >
                        <BiDotsVertical size={18} />
                      </RadixButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/cms/${cms.key}`}
                          onClick={() => handleInteraction(cms.key)}
                        >
                          <MdEditSquare />
                          Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      {/* <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        color="red"
                        onClick={() => setDeleteId(cms._id)}
                      >
                        <BiTrash  />
                        Delete
                      </DropdownMenu.Item> */}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
                <Table.Cell>
                  <Text weight="bold">{cms.key}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color={cms.is_public ? "green" : "gray"}>
                    {cms.is_public ? "Yes" : "No"}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text size="2" color="gray">
                    {new Date(cms.updatedAt).toLocaleDateString()}
                  </Text>
                </Table.Cell>
              </InteractiveTableRow>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <Box mt="4">
          <TablePagination
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete CMS Content</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this CMS content? This action cannot
            be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <RadixButton>Cancel</RadixButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <RadixButton
                onClick={handleDeleteConfirm}
                disabled={deleteCms.isPending}
              >
                {deleteCms.isPending ? "Deleting..." : "Delete"}
              </RadixButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Container>
  );
}
