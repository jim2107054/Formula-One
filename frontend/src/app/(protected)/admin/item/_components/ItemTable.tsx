"use client";

import {
  Badge,
  Box,
  DropdownMenu,
  Flex,
  Button as RadixButton,
  Skeleton,
  Table,
  Text,
} from "@radix-ui/themes";
import { memo } from "react";
import { BiDotsVertical, BiFile, BiTrash } from "react-icons/bi";
import { FaBook, FaFolder, FaPlay } from "react-icons/fa";

import type { Item } from "@/zustand/types/item";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { formatDateTime } from "@/lib/utils";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { MdEditSquare } from "react-icons/md";

interface ItemTableProps {
  items: Item[];
  loading?: boolean;
  headers?: {
    item: string;
    type: string;
    mediaType: string;
    lesson: string;
    section: string;
    module: string;
    duration: string;
    status: string;
    created: string;
    updated: string;
    action: string;
  };
  onDelete?: (itemId: string, itemTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  item: "Item",
  type: "Item Type",
  mediaType: "Media Type",
  lesson: "Lesson",
  section: "Section",
  module: "Module",
  duration: "Duration",
  status: "Status",
  created: "Created At",
  updated: "Updated At",
} as const;

const EmptyState = memo(() => (
  <Flex direction="column" align="center" justify="center" gap="4">
    <Box>
      <BiFile size={48} color="gray" />
    </Box>
    <Text size="4" color="gray">
      No items found
    </Text>
    <Text size="2" color="gray">
      Get started by creating your first item?
    </Text>
  </Flex>
));
EmptyState.displayName = "EmptyState";

const SkeletonRow = memo(() => (
  <Table.Row>
    <Table.Cell justify="end">
      <Skeleton height="20px" width="10px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="120px" className="mb-1" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="100px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="40px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="40px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="60px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="70px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
    </Table.Cell>
  </Table.Row>
));
SkeletonRow.displayName = "SkeletonRow";

const ItemTable = ({
  items,
  loading = false,
  headers,
  onDelete,
}: ItemTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/item");

  const getItemTypeColor = (
    type: string
  ):
    | "blue"
    | "green"
    | "orange"
    | "red"
    | "purple"
    | "cyan"
    | "pink"
    | "gray" => {
    switch (type) {
      case "video":
        return "blue";
      case "text":
        return "green";
      case "quiz":
        return "orange";
      case "exam":
        return "red";
      case "resource":
        return "purple";
      case "upload":
        return "cyan";
      case "assignment":
        return "pink";
      default:
        return "gray";
    }
  };

  const formatItemType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDeleteClick = (itemId: string, itemTitle: string) => {
    handleInteraction(itemId);
    onDelete?.(itemId, itemTitle);
  };

  return (
    <Flex direction="column" gap="5">
      <Table.Root variant="surface" size="2" className="w-full table-fixed">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell justify="start">
              {tableHeaders.action}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{tableHeaders.item}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="whitespace-nowrap">
              {tableHeaders.type}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="whitespace-nowrap">
              {tableHeaders.mediaType}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.status}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.duration}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.lesson}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.section}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.module}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.created}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.updated}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <SkeletonRow key={`skeleton-${index}`} />
            ))
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={10}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => (
              <InteractiveTableRow
                key={item?._id}
                isLastInteracted={isLastInteracted(item?._id)}
              >
                <Table.Cell justify="start">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <RadixButton
                        variant="ghost"
                        className="!text-accent !cursor-pointer"
                      >
                        <BiDotsVertical size={18} />
                      </RadixButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/item/${item?._id}?courseId=${item?.courseId?._id}&sectionId=${item?.sectionId?._id}&lessonId=${item?.lessonId?._id}&edit=true`}
                          onClick={() => handleInteraction(item?._id)}
                        >
                          <MdEditSquare /> Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/module?byItem=${item?._id}`}
                          onClick={() => handleInteraction(item?._id)}
                        >
                          <FaBook /> Module
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/section?byItem=${item?._id}`}
                          onClick={() => handleInteraction(item?._id)}
                        >
                          <FaFolder /> Section
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/lesson?byItem=${item?._id}`}
                          onClick={() => handleInteraction(item?._id)}
                        >
                          <FaPlay /> Lesson
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        color="red"
                        onClick={() =>
                          handleDeleteClick(item?._id, item?.title)
                        }
                        className="!cursor-pointer"
                      >
                        <BiTrash /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>

                <Table.RowHeaderCell>
                  <Text weight="medium" truncate className="line-clamp-2">
                    {item?.title}
                  </Text>
                </Table.RowHeaderCell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    size="1"
                    color={getItemTypeColor(item?.type)}
                  >
                    {formatItemType(item?.type)}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    size="1"
                    color={getItemTypeColor(item?.content?.mediaType ?? "gray")}
                  >
                    {item?.content?.mediaType
                      ? formatItemType(item.content.mediaType)
                      : "-"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    color={item?.isPublished ? "green" : "orange"}
                    size="1"
                  >
                    {item?.isPublished ? "Published" : "Draft"}
                  </Badge>
                </Table.Cell>

                <Table.Cell justify="center">
                  <Text className="whitespace-nowrap">
                    {item?.estimatedDuration
                      ? `${item?.estimatedDuration} mins`
                      : "-"}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant="soft" size="1">
                    {item?.lessonId?.title || "-"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant="soft" size="1">
                    {item?.sectionId?.title || "-"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant="soft" size="1">
                    {item?.courseId?.title || "-"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {formatDateTime(item?.createdAt)}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {formatDateTime(item?.updatedAt)}
                  </Text>
                </Table.Cell>
              </InteractiveTableRow>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};

export default memo(ItemTable);
