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
import { BiBookOpen, BiDotsVertical, BiTrash } from "react-icons/bi";
import { FaBook, FaFolder, FaList } from "react-icons/fa";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { formatDateTime } from "@/lib/utils";
import type { Lesson } from "@/zustand/types/lesson";
import type { Section } from "@/zustand/types/section";
import { MdEditSquare } from "react-icons/md";

interface LessonTableProps {
  lessons: Lesson[];
  sections?: Section[];
  loading?: boolean;
  headers?: {
    module: string;
    section: string;
    lesson: string;
    status: string;
    items: string;
    created: string;
    updated: string;
    action: string;
  };
  params: Record<string, unknown>;
  onDelete?: (lessonId: string, lessonTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  module: "Module",
  section: "Section",
  lesson: "Lesson",
  status: "Status",
  items: "Items",
  created: "Created At",
  updated: "Updated At",
} as const;

const EmptyState = memo(() => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <BiBookOpen className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">No lessons found</p>
      <p className="text-sm text-gray-400">
        Get started by creating your first lesson?.
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
      <Skeleton height="10px" width="70px" />
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

const LessonTable = ({
  lessons,
  sections,
  loading = false,
  headers,
  onDelete,
}: LessonTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/lesson");

  const handleDeleteClick = (lessonId: string, lessonTitle: string) => {
    handleInteraction(lessonId);
    onDelete?.(lessonId, lessonTitle);
  };

  const getSectionTitle = (lesson: Lesson, sections?: Section[]) => {
    if (!lesson.sectionId) return "-";
    const sectionId =
      typeof lesson.sectionId === "string"
        ? lesson.sectionId
        : lesson.sectionId?._id;
    const section = sections?.find((s) => s._id === sectionId);
    return (
      section?.title ||
      (typeof lesson.sectionId === "object"
        ? lesson.sectionId?.title
        : sectionId) ||
      "-"
    );
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
              {tableHeaders.lesson}
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
          ) : lessons.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={10}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            lessons.map((lesson: Lesson) => (
              <InteractiveTableRow
                key={lesson?._id}
                isLastInteracted={isLastInteracted(lesson?._id)}
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
                          href={`/admin/lesson/${lesson?._id}?edit=true`}
                          onClick={() => handleInteraction(lesson?._id)}
                        >
                          <MdEditSquare /> Edit
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/module?byLesson=${lesson?._id}`}
                          onClick={() => handleInteraction(lesson?._id)}
                        >
                          <FaBook /> Module
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/section?byLesson=${lesson?._id}`}
                          onClick={() => handleInteraction(lesson?._id)}
                        >
                          <FaFolder /> Section
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <InteractiveLink
                          href={`/admin/item?courseId=${lesson?.courseId?._id}&sectionId=${lesson?.sectionId?._id}&lessonId=${lesson?._id}`}
                          onClick={() => handleInteraction(lesson?._id)}
                        >
                          <FaList /> Item
                        </InteractiveLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        color="red"
                        onClick={() =>
                          handleDeleteClick(lesson?._id, lesson?.title)
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
                    {lesson?.title}
                  </Text>
                </Table.RowHeaderCell>

                <Table.Cell>
                  <Badge variant="soft" size="1">
                    {getSectionTitle(lesson, sections)}
                  </Badge>
                </Table.Cell>

                <Table.RowHeaderCell>
                  <Badge variant="soft" size="1">
                    <Text className="font-medium truncate" truncate>
                      {lesson?.courseId?.title}
                    </Text>
                  </Badge>
                </Table.RowHeaderCell>

                <Table.Cell>
                  <Badge
                    variant="soft"
                    color={lesson?.isPublished ? "green" : "orange"}
                    size="1"
                  >
                    {lesson?.isPublished ? "Published" : "Draft"}
                  </Badge>
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap">{lesson?.itemCount}</span>
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap">
                    {formatDateTime(lesson?.createdAt)}
                  </span>
                </Table.Cell>

                <Table.Cell>
                  <span className="whitespace-nowrap">
                    {formatDateTime(lesson?.updatedAt)}
                  </span>
                </Table.Cell>
              </InteractiveTableRow>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};

export default memo(LessonTable);
