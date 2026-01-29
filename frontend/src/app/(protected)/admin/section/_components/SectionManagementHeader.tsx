import Link from "next/link";
import { Flex } from "@radix-ui/themes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdKeyboardBackspace, MdRefresh } from "react-icons/md";

import { Button } from "../../_components/button";
import { StatusSelector } from "../../_components/search-selector";
import ModuleSearch from "../../_components/search-selector/module-searchbar";
import SearchBar from "../../_components/searchbar/searchbar";
import { statusOptions } from "@/zustand/types/status";
import GoBack from "@/components/common/go-back";

interface SectionManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function SectionManagementHeader({
  fetching,
  params,
  handleRefresh,
  handleFilter,
  clearFilters,
}: SectionManagementHeaderProps) {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap">
        <SearchBar
          value={String(params?.search || "")}
          onSearch={(q) => handleFilter({ search: q })}
          placeholder="Search by section title or description"
          fetching={fetching}
        />
        <ModuleSearch
          value={String(params?.courseId || "")}
          onSelectModule={(id) => handleFilter({ courseId: id })}
          disabled={fetching}
        />
        <StatusSelector
          value={
            params?.isPublished === true || params?.isPublished === "true"
              ? "published"
              : params?.isPublished === false || params?.isPublished === "false"
              ? "draft"
              : undefined
          }
          statuses={statusOptions}
          onStatusSelect={(id) =>
            handleFilter({
              isPublished:
                id === "published" ? true : id === "draft" ? false : undefined,
            })
          }
        />
      </Flex>

      <Flex className="flex gap-2">
        <GoBack />
        <Link href={"/admin/module"}>
          <Button>
            <MdKeyboardBackspace />
            Back to Module
          </Button>
        </Link>
        <Link
          href={
            params?.courseId
              ? `/admin/section/create?courseId=${params?.courseId}`
              : "/admin/section/create"
          }
        >
          <Button className="cursor-pointer">
            <FaPlus />
            Create Section
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
