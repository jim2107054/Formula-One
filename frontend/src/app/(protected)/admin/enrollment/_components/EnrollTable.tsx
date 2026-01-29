"use client";

import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";
import type { Enroll } from "@/zustand/types/enroll";
import {
  Badge,
  DropdownMenu,
  Flex,
  Button as RadixButton,
  Skeleton,
  Table,
} from "@radix-ui/themes";
import { memo } from "react";
import { BiDotsVertical, BiLoader, BiTrash } from "react-icons/bi";
import { FaBook, FaUser } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";

interface EnrollTableProps {
  enrolls: Enroll[];
  loading?: boolean;
  onOptimisticCopy?: (enrollId: string) => Promise<void>;
  onDeleteDialog?: (enrollId: string, label?: string) => void;
  optimisticLoading?: Record<string, "delete" | "copy">;
}

const DEFAULT_HEADERS = {
  action: "Action",
  user: "User",
  course: "Module",
  status: "Status",
  progress: "Progress",
  enrolledOn: "Enrolled On",
  expires: "Expires",
} as const;

const EmptyState = memo(() => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500">No enrollments found</p>
      <p className="text-sm text-gray-400">
        Create an enrollment to get started.
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
      <Skeleton height="10px" width="180px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
    </Table.Cell>
    <Table.Cell>
      <Skeleton height="10px" width="80px" />
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

const EnrollTable = ({
  enrolls,
  loading = false,
  onDeleteDialog,
  optimisticLoading,
}: EnrollTableProps) => {
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/enrollment");

  const visible = enrolls || [];

  return (
    <Flex direction="column">
      <Table.Root variant="surface" size="2" className="w-full table-fixed">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.action}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.user}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.course}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.status}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.progress}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.enrolledOn}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {DEFAULT_HEADERS.expires}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : visible.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            visible.map((e: Enroll) => {
              const key = e?._id;
              const isLast = isLastInteracted(key);
              const isDeleting = optimisticLoading?.[key] === "delete";

              return (
                <InteractiveTableRow key={key} isLastInteracted={isLast}>
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
                            href={`/admin/enrollment/${e?._id}?edit=true`}
                            onClick={() => handleInteraction(e?._id)}
                          >
                            <MdEditSquare /> Edit
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/user`}
                            onClick={() => handleInteraction(e?._id)}
                          >
                            <FaUser /> User
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/module`}
                            onClick={() => handleInteraction(e?._id)}
                          >
                            <FaBook /> Module
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          onClick={() => {
                            handleInteraction(e?._id);
                            onDeleteDialog?.(
                              e?._id,
                              e.user?.name || e.course?.title || ""
                            );
                          }}
                          color="red"
                          disabled={isDeleting}
                          className="cursor-pointer!"
                        >
                          {isDeleting ? (
                            <>
                              <BiLoader
                                className="animate-spin mr-2"
                                size={14}
                              />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <BiTrash /> Delete
                            </>
                          )}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>

                  <Table.Cell>{e?.user?.name || "Unknown"}</Table.Cell>
                  <Table.Cell>{e?.course?.title || "Unknown"}</Table.Cell>

                  <Table.Cell>
                    <Badge variant="soft" size="1">
                      {e?.status || "-"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    {e?.is_expired ? (
                      <span>Expired</span>
                    ) : (
                      <span>
                        {e?.course && e?.course.totalSections
                          ? `${Math.round(
                              ((e?.course?.completedSections || 0) /
                                (e?.course?.totalSections || 1)) *
                                100
                            )}%`
                          : "-"}
                      </span>
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </Table.Cell>

                  <Table.Cell>
                    {e.expires_at
                      ? new Date(e.expires_at).toLocaleDateString()
                      : "-"}
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

export default memo(EnrollTable);
