import Link from "next/link";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import SearchBar from "../../_components/searchbar/searchbar";
import {
  EmailVerifiedStatusSelector,
  GenderSelector,
  RoleSelector,
  InstructorVerifiedStatusSelector,
} from "../../_components/search-selector";
import { Button } from "../../_components/button";
import { Flex } from "@radix-ui/themes";
import { UserRole } from "@/zustand/types/user";

interface UserManagementHeaderProps {
  fetching?: boolean;
  currentParams: Record<string, unknown>;
  handleFilter: (filters: Record<string, unknown>) => void;
  handleRefresh: () => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function UserManagementHeader({
  fetching,
  currentParams,
  handleFilter,
  handleRefresh,
  clearFilters,
}: UserManagementHeaderProps) {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap" align="center">
        <SearchBar
          value={String(currentParams.search || "")}
          onSearch={(q) => handleFilter({ search: q })}
          placeholder="Search by name or email"
          fetching={fetching}
        />

        <RoleSelector
          value={
            currentParams.role !== undefined && currentParams.role !== ""
              ? (() => {
                  const num =
                    typeof currentParams.role === "string"
                      ? parseInt(currentParams.role, 10)
                      : Number(currentParams.role);
                  return num === 0 || num === 1 || num === 2
                    ? (num as UserRole)
                    : undefined;
                })()
              : undefined
          }
          onRoleSelect={(role) =>
            handleFilter({ role: role !== undefined ? role : undefined })
          }
        />

        <GenderSelector
          value={currentParams.gender as string}
          onGenderSelect={(gender) =>
            handleFilter({ gender: gender || undefined })
          }
        />

        <InstructorVerifiedStatusSelector
          value={
            currentParams.teacher_verified === "true"
              ? "true"
              : currentParams.teacher_verified === "false"
              ? "false"
              : ""
          }
          onSelect={(value) =>
            handleFilter({
              teacher_verified:
                value === "true" ? true : value === "false" ? false : undefined,
            })
          }
        />

        <EmailVerifiedStatusSelector
          value={
            currentParams.email_verified === "true"
              ? "true"
              : currentParams.email_verified === "false"
              ? "false"
              : ""
          }
          onSelect={(value) =>
            handleFilter({
              email_verified:
                value === "true" ? true : value === "false" ? false : undefined,
            })
          }
        />
      </Flex>

      <Flex gap="2" justify="start" align="center">
        <Link href="/admin/user/create">
          <Button className="cursor-pointer">
            <FaPlus />
            Create User
          </Button>
        </Link>
        <Button onClick={handleRefresh}>
          <MdRefresh size={20} className={fetching ? "animate-spin" : ""} />
          Refresh
        </Button>
        <Button
          variant="danger-outline"
          onClick={() => clearFilters()}
          className="cursor-pointer"
        >
          <FaTrashAlt />
          Clear Filters
        </Button>
      </Flex>
    </Flex>
  );
}
