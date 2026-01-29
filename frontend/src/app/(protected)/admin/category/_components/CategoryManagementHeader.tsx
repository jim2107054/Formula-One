import Link from "next/link";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { Flex } from "@radix-ui/themes";

import { statusOptions } from "@/zustand/types/status";
import SearchBar from "../../_components/searchbar/searchbar";
import { Button } from "../../_components/button";
import { StatusSelector } from "../../_components/search-selector";

interface CategoryManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function CategoryManagementHeader({
  fetching,
  params,
  handleRefresh,
  handleFilter,
  clearFilters,
}: CategoryManagementHeaderProps) {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap" align="center">
        <SearchBar
          value={String(params.search || "")}
          onSearch={(q) => handleFilter({ search: q })}
          placeholder="Search by title or description"
          fetching={fetching}
        />

        <StatusSelector
          value={
            params?.is_published === true || params?.is_published === "true"
              ? "published"
              : params?.is_published === false ||
                params?.is_published === "false"
              ? "draft"
              : undefined
          }
          statuses={statusOptions}
          onStatusSelect={(id) =>
            handleFilter({
              is_published:
                id === "published" ? true : id === "draft" ? false : undefined,
            })
          }
        />
      </Flex>

      <Flex gap="2" justify="start" align="center">
        <Link href="/admin/category/create">
          <Button className="cursor-pointer">
            <FaPlus />
            Create Category
          </Button>
        </Link>
        <Button onClick={handleRefresh}>
          <MdRefresh size={20} className={fetching ? "animate-spin" : ""} />
          Refresh
        </Button>
        <Button variant="danger-outline" onClick={() => clearFilters()} className="cursor-pointer">
          <FaTrashAlt />
          Clear Filters
        </Button>
      </Flex>
    </Flex>
  );
}
