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
import { FaBook, FaGraduationCap, FaUser } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";

import type { User } from "@/zustand/types/user";
import { InteractiveLink } from "@/components/ui/table/InteractiveLink";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";
import { useTableInteraction } from "@/hooks/useTableInteraction";

interface UserTableProps {
  users: User[];
  loading?: boolean;
  headers?: Partial<typeof DEFAULT_HEADERS>;
  onDeleteDialog?: (userId: string, userName: string) => void;
}

const DEFAULT_HEADERS = {
  action: "Action",
  name: "Name",
  email: "Email",
  phone: "Phone",
  gender: "Gender",
  email_verified: "Email Verified",
  phone_verified: "Phone Verified",
  teacher_verified: "Teacher Verified",
  role: "Role",
} as const;

const EmptyState = () => (
  <Flex direction="column" align="center" justify="center" py="8" gap="2">
    <FaUser size={48} color="var(--gray-6)" />
    <Text size="3" color="gray" weight="medium">
      No users found
    </Text>
    <Text size="2" color="gray" weight="medium">
      Try adjusting your filters.
    </Text>
  </Flex>
);

const SkeletonRow = () => (
  <Table.Row>
    {Array.from({ length: 10 }).map((_, i) => (
      <Table.Cell key={i}>
        <Skeleton height="12px" width="90%" />
      </Table.Cell>
    ))}
  </Table.Row>
);

const roleLabels: Record<string, string> = {
  "2": "Admin",
  "1": "Instructor",
  "0": "Student",
};

const roleColors: Record<string, "red" | "blue" | "green" | "gray"> = {
  "2": "red",
  "1": "blue",
  "0": "green",
  default: "gray",
};

const booleanBadge = (val: boolean) => (
  <Badge size="1" variant="soft" color={val ? "green" : "red"}>
    {val ? "Yes" : "No"}
  </Badge>
);

const UserTable = ({
  users,
  loading = false,
  headers,
  onDeleteDialog,
}: UserTableProps) => {
  const tableHeaders = { ...DEFAULT_HEADERS, ...headers };
  const { handleInteraction, isLastInteracted } =
    useTableInteraction("/admin/user");

  const deleteHandler = (id: string, name: string) => {
    handleInteraction(id);
    onDeleteDialog?.(id, name);
  };

  return (
    <Flex direction="column">
      <Table.Root variant="surface" size="2" className="w-full">
        <Table.Header>
          <Table.Row>
            {Object.values(tableHeaders).map((h) => (
              <Table.ColumnHeaderCell key={h}>{h}</Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          ) : users.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={10}>
                <EmptyState />
              </Table.Cell>
            </Table.Row>
          ) : (
            users.map((user) => {
              const role = String(user?.role);

              return (
                <InteractiveTableRow
                  key={user?._id}
                  isLastInteracted={isLastInteracted(user?._id)}
                >
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <RadixButton variant="ghost" className="!text-accent !cursor-pointer">
                          <BiDotsVertical size={18} />
                        </RadixButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/user/${user?._id}`}
                            onClick={() => handleInteraction(user?._id)}
                          >
                            <MdEditSquare /> Edit
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/module?user=${user?._id}`}
                            onClick={() => handleInteraction(user?._id)}
                          >
                            <FaBook /> Module
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item asChild>
                          <InteractiveLink
                            href={`/admin/enrollment?user=${user?._id}`}
                            onClick={() => handleInteraction(user?._id)}
                          >
                            <FaGraduationCap /> Enroll
                          </InteractiveLink>
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          color="red"
                          onClick={() => deleteHandler(user?._id, user?.name)}
                          className="cursor-pointer!"
                        >
                          <BiTrash /> Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <Text weight="medium" truncate>
                      {user?.name || "-"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{user?.email}</Table.Cell>
                  <Table.Cell>{user?.phone || "-"}</Table.Cell>
                  <Table.Cell>{user?.gender || "-"}</Table.Cell>
                  <Table.Cell>
                    {booleanBadge(!!user?.email_verified)}
                  </Table.Cell>
                  <Table.Cell>
                    {booleanBadge(!!user?.phone_verified)}
                  </Table.Cell>
                  <Table.Cell>
                    {booleanBadge(!!user?.teacher_verified)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="1"
                      variant="soft"
                      color={roleColors[role] || roleColors.default}
                    >
                      {roleLabels[role] || "Unknown"}
                    </Badge>
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

export default memo(UserTable);
