"use client";

import {
  Badge,
  DropdownMenu,
  Flex,
  Button as RadixButton,
  Skeleton,
  Table,
  Text,
} from "@radix-ui/themes";
import { memo } from "react";
import { BiDotsVertical, BiTrash } from "react-icons/bi";
import { FaBook, FaTag } from "react-icons/fa";
import parse from "html-react-parser";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import type { Tag } from "@/zustand/types/tag";
import { MdEditSquare } from "react-icons/md";

interface TagTableProps {
  tags: Tag[];
  loading?: boolean;
  headers?: {
    title: string;
    description: string;
    published: string;
    action: string;
  };
  onDeleteDialog?: (tagId: string, tagTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  title: "Title",
  description: "Description",
  published: "Published",
} as const;

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <FaTag className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">No tags found</p>
      <p className="text-sm text-gray-400">
        Get started by creating your first tag.
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

const TagTable = ({
  tags,
  loading = false,
  headers,
  onDeleteDialog,
}: TagTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/tag");

  const handleDeleteClick = (tagId: string, tagTitle: string) => {
    handleInteraction(tagId);
    onDeleteDialog?.(tagId, tagTitle);
  };

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
              {tableHeaders.published}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          ) : tags.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            tags.map((tag: Tag) => (
              <InteractiveTableRow
                key={tag._id}
                isLastInteracted={isLastInteracted(tag._id)}
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
                          href={`/admin/tag/${tag._id}`}
                          onClick={() => handleInteraction(tag._id)}
                        >
                          <MdEditSquare /> Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/module`}
                          onClick={() => handleInteraction(tag._id)}
                        >
                          <FaBook /> Module
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={() => handleDeleteClick(tag._id, tag.title)}
                        color="red"
                        className="cursor-pointer!"
                      >
                        <BiTrash /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>

                <Table.RowHeaderCell>
                  <Text weight="medium">{tag.title}</Text>
                </Table.RowHeaderCell>

                <Table.Cell>
                  {tag.desc ? (
                    <Text title={tag.desc}>{parse(tag.desc)}</Text>
                  ) : (
                    <Text color="gray">-</Text>
                  )}
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    size="1"
                    color={tag.is_published ? "green" : "red"}
                  >
                    {tag.is_published ? "Published" : "Draft"}
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

export default memo(TagTable);
