"use client";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import { formatDateTime } from "@/lib/utils";
import type { Course } from "@/zustand/types/course";
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
import {
  FaCopy,
  FaFolder,
  FaGraduationCap,
  FaList,
  FaPlay,
  FaUsers,
} from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";

interface ModuleTableProps {
  courses: Course[];
  loading?: boolean;
  isCopying?: boolean;
  deepCopyCourse: (courseId: string) => void;
  headers?: {
    course: string;
    instructor: string;
    category: string;
    language: string;
    level: string;
    status: string;
    rating: string;
    enrollments: string;
    created: string;
    updated: string;
    certificate: string;
    action: string;
  };
  onDelete?: (courseId: string, courseTitle: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  course: "Module",
  instructor: "Instructor",
  category: "Category",
  language: "Language",
  level: "Level",
  status: "Status",
  enrollments: "Enrollments",
  created: "Created At",
  updated: "Updated At",
  certificate: "Certificate",
} as const;

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <BiBookOpen className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-500">No courses found</p>
      <p className="text-sm text-gray-400">
        Get started by creating your first course.
      </p>
    </div>
  </div>
);

const SkeletonRow = () => (
  <Table.Row>
    {Array.from({ length: 13 }).map((_, idx) => (
      <Table.Cell key={idx}>
        <Skeleton height="10px" width="80px" />
      </Table.Cell>
    ))}
  </Table.Row>
);

const ModuleTable = ({
  courses,
  loading = false,
  isCopying = false,
  deepCopyCourse,
  headers,
  onDelete,
}: ModuleTableProps) => {
  const tableHeaders = headers || DEFAULT_HEADERS;
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/course");

  const handleDeleteClick = (courseId: string, courseTitle: string) => {
    handleInteraction(courseId);
    onDelete?.(courseId, courseTitle);
  };

  const handleCopyClick = (courseId: string) => {
    handleInteraction(courseId);
    deepCopyCourse(courseId);
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
              {tableHeaders.course}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.instructor}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.category}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.language}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.level}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.status}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.enrollments}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {tableHeaders.certificate}
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
          {loading || isCopying ? (
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          ) : courses.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={13}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            courses.map((course: Course) => {
              const instructor =
                typeof course?.instructor === "object"
                  ? course?.instructor
                  : null;

              return (
                <InteractiveTableRow
                  key={course?._id}
                  isLastInteracted={isLastInteracted(course?._id)}
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
                            href={`/admin/module/${course?.slug}?edit=true`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <MdEditSquare /> Edit
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            onClick={() => handleCopyClick(course?._id)}
                          >
                            <FaCopy /> Copy
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/user?courseId=${course?._id}`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <FaUsers /> User
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/section?courseId=${course?._id}`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <FaFolder /> Section
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/lesson?courseId=${course?._id}`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <FaPlay /> Lesson
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/item?courseId=${course?._id}`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <FaList /> Item
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/enrollment?courseId=${course?._id}`}
                            onClick={() => handleInteraction(course?._id)}
                          >
                            <FaGraduationCap /> Enroll
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          color="red"
                          onClick={() =>
                            handleDeleteClick(course?._id, course?.title || "")
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
                      {course?.title}
                    </Text>
                  </Table.RowHeaderCell>

                  <Table.Cell>
                    {instructor ? (
                      <Flex direction="column">
                        {instructor.name && (
                          <Text weight="medium" truncate>
                            {instructor.name}
                          </Text>
                        )}
                        {instructor.email && (
                          <Text size="1" truncate>
                            {instructor.email}
                          </Text>
                        )}
                      </Flex>
                    ) : (
                      <Text size="1" color="gray">
                        -
                      </Text>
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    <Badge variant="soft" size="1">
                      {course?.category || "-"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {course?.language || "-"}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge variant="soft" size="1">
                      {course?.level || "-"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge
                      variant="soft"
                      color={course?.isPublished ? "green" : "orange"}
                      size="1"
                    >
                      {course?.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {course?.enrollmentCount || 0}
                    </span>
                  </Table.Cell>

                  {/* New Certificate Column */}
                  <Table.Cell>
                    {course?.isCertificateAvailable ? (
                      <Badge variant="soft" color="green">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="soft" color="red">
                        No
                      </Badge>
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {course?.createdAt
                        ? formatDateTime(course?.createdAt)
                        : "-"}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {course?.updatedAt
                        ? formatDateTime(course?.updatedAt)
                        : "-"}
                    </span>
                  </Table.Cell>
                </InteractiveTableRow>
              );
            })
          )}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};

export default memo(ModuleTable);
