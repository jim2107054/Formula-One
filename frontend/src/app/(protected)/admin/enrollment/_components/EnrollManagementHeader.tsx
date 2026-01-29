import Link from "next/link";
import { Flex } from "@radix-ui/themes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

import { Button } from "../../_components/button";
import { StatusSelector, UserSearch } from "../../_components/search-selector";
import ModuleSearch from "../../_components/search-selector/module-searchbar";

interface EnrollManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function EnrollManagementHeader({
  fetching,
  params,
  handleRefresh,
  handleFilter,
  clearFilters,
}: EnrollManagementHeaderProps) {
  const statuses = [
    { id: "pending", name: "Pending" },
    { id: "paid", name: "Paid" },
    { id: "canceled", name: "Canceled" },
    { id: "refunded", name: "Refunded" },
  ];

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap" align="center">
        <UserSearch
          role={0} // role 0 = student
          value={params?.user as string}
          onChange={(value) => handleFilter({ user: value || undefined })}
          placeholder="Search by learner"
          currentUserName={(params?.user as { name?: string } | null)?.name}
        />
        <ModuleSearch
          value={String(params?.courseId || "")}
          onSelectModule={(id) => handleFilter({ courseId: id })}
          disabled={fetching}
        />
        <StatusSelector
          value={params?.status as string}
          statuses={statuses}
          onStatusSelect={(id) => handleFilter({ status: id || undefined })}
        />
      </Flex>

      <Flex gap="2" justify="start" align="center">
        <Link href="/admin/enrollment/create">
          <Button className="cursor-pointer">
            <FaPlus />
            Create Enrollment
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
