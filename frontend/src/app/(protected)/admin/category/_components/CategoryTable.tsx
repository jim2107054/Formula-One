"use client";

import { memo } from "react";
import {
  Badge,
  DropdownMenu,
  Flex,
  Button as RadixButton,
  Skeleton,
  Table,
  Text,
} from "@radix-ui/themes";
import { BiCategory, BiDotsVertical, BiTrash } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import parse from "html-react-parser";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { Category } from "@/zustand/types/category";
import { MdEditSquare } from "react-icons/md";

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  headers?: {
    title: string;
    description: string;
    published: string;
    action: string;
    status?: boolean;
  };
  onDeleteDialog?: (categoryId: string, categoryTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  title: "Title",
  description: "Description",
  status: "Status",
  order: "Order",
} as const;

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <BiCategory className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">No categories found</p>
      <p className="text-sm text-gray-400">
        Get started by creating your first category.
      </p>
    </div>
  </div>
);

const SkeletonRow = () => (
  <Table.Row>
    <Table.Cell justify="end">
      <Skeleton height="20px" width="10px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="120px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="200px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
    </Table.Cell>
  </Table.Row>
);

const CategoryTable = ({
  categories,
  loading = false,
  headers,
  onDeleteDialog,
}: CategoryTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/category");

  const handleDeleteClick = (categoryId: string, categoryTitle: string) => {
    handleInteraction(categoryId);
    onDeleteDialog?.(categoryId, categoryTitle);
  };

  console.log("CATEGORIES in CategoryTable", categories);

  return (
    <Flex direction="column" gap="5">
      <Table.Root variant="surface" size="2" className="w-full">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {tableHeaders.action}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.title}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.description}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.status}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          ) : categories.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            categories.map((category: Category) => (
              <InteractiveTableRow
                key={category._id}
                isLastInteracted={isLastInteracted(category._id)}
              >
                <Table.Cell justify="start">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <RadixButton variant="ghost" className="!text-accent !cursor-pointer">
                        <BiDotsVertical size={18} />
                      </RadixButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/category/${category._id}`}
                          onClick={() => handleInteraction(category._id)}
                        >
                          <MdEditSquare /> Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/module?category=${category.title}`}
                          onClick={() => handleInteraction(category._id)}
                        >
                          <FaBook /> Module
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={() =>
                          handleDeleteClick(category._id, category.title)
                        }
                        color="red"
                        className="cursor-pointer!"
                      >
                        <BiTrash /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>

                <Table.Cell>
                  <Text weight="medium">{category.title}</Text>
                </Table.Cell>

                <Table.Cell>
                  {category.desc ? (
                    <Text
                      title={category.desc.replace(/<[^>]+>/g, "")}
                      className="line-clamp-2"
                    >
                      {parse(category.desc)}
                    </Text>
                  ) : (
                    <Text className="text-gray-400">No description</Text>
                  )}
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    size="1"
                    color={category.is_published === true ? "green" : "red"}
                  >
                    {category.is_published === true ? "Published" : "Draft"}
                  </Badge>
                </Table.Cell>
              </InteractiveTableRow>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};

export default memo(CategoryTable);
