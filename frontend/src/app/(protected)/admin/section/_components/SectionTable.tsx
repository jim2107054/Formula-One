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
import { BiBookOpen, BiDotsVertical, BiTrash } from "react-icons/bi";
import { FaBook, FaList, FaPlay } from "react-icons/fa";

import { formatDateTime } from "@/lib/utils";
import type { Section } from "@/zustand/types/section";
import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { MdEditSquare } from "react-icons/md";

interface SectionTableProps {
  sections?: Section[];
  loading: boolean;
  headers?: {
    section: string;
    module: string;
    lessons: string;
    items: string;
    status: string;
    created: string;
    updated: string;
    action: string;
  };
  params: Record<string, unknown>;
  onDelete?: (sectionId: string, sectionTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  section: "Section",
  module: "Module",
  lessons: "Lesson",
  items: "Item",
  status: "Status",
  created: "Created At",
  updated: "Updated At",
} as const;

const EmptyState = memo(() => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <BiBookOpen className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">No sections found</p>
      <p className="text-sm text-gray-400">
        Get started by creating your first section.
      </p>
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

const SkeletonRow = memo(() => (
  <Table.Row>
    <Table.Cell justify="end">
      <Skeleton height="20px" width="10px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="120px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="100px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="60px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="50px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="40px" />
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

const SectionTable = ({
  sections,
  loading = false,
  headers,
  params,
  onDelete,
}: SectionTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/section");

  const handleDeleteClick = (sectionId: string, sectionTitle: string) => {
    handleInteraction(sectionId);
    onDelete?.(sectionId, sectionTitle);
  };

  return (
    <Flex direction="column" gap="5">
      <Table.Root variant="surface" size="2" className="w-full table-fixed">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {tableHeaders.action}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.section}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.module}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.status}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.lessons}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.items}
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
          ) : sections?.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={10}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            sections?.map((section: Section) => (
              <InteractiveTableRow
                key={section?._id}
                isLastInteracted={isLastInteracted(section?._id)}
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
                          href={
                            params?.courseId
                              ? `/admin/section/${section?._id}?edit=true`
                              : `/admin/section/${section?._id}?edit=true`
                          }
                          onClick={() => handleInteraction(section?._id)}
                        >
                          <MdEditSquare /> Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/module?bySection=${section?._id}`}
                          onClick={() => handleInteraction(section?._id)}
                        >
                          <FaBook /> Module
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/lesson?courseId=${section?.courseId?._id}&sectionId=${section?._id}`}
                          onClick={() => handleInteraction(section?._id)}
                        >
                          <FaPlay /> Lesson
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/item?courseId=${section?.courseId?._id}&sectionId=${section?._id}`}
                          onClick={() => handleInteraction(section?._id)}
                        >
                          <FaList /> Item
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        color="red"
                        onClick={() =>
                          handleDeleteClick(section?._id, section?.title)
                        }
                        className="cursor-pointer!"
                      >
                        <BiTrash /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>

                <Table.RowHeaderCell>
                  <Text weight="medium" truncate>
                    {section?.title}
                  </Text>
                </Table.RowHeaderCell>

                <Table.Cell>
                  <Badge variant="soft" size="1">
                    {section?.courseId?.title || "—"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    color={section?.isPublished ? "green" : "orange"}
                    size="1"
                  >
                    {section?.isPublished ? "Published" : "Draft"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {section?.lessonsCount || section?.lessons?.length || 0}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {section?.itemsCount || 0}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {formatDateTime(section?.createdAt)}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text className="whitespace-nowrap">
                    {formatDateTime(section?.updatedAt)}
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

export default memo(SectionTable);
