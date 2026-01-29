import Link from "next/link";
import { Flex } from "@radix-ui/themes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";

import SearchBar from "../../_components/searchbar/searchbar";
import { Button } from "../../_components/button";
import {
  LanguageSelector,
  LevelSelector,
  StatusSelector,
  UserSearch,
} from "../../_components/search-selector";
import CategorySearch from "../../_components/search-selector/category-search";
import { statusOptions } from "@/zustand/types/status";
import GoBack from "@/components/common/go-back";

interface ModuleManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  levels: { id: string; name: string }[];
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function ModuleManagementHeader({
  fetching,
  params,
  levels,
  handleRefresh,
  handleFilter,
  clearFilters,
}: ModuleManagementHeaderProps) {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap" align="center">
        <SearchBar
          value={String(params?.search || "")}
          onSearch={(q) => handleFilter({ search: q })}
          placeholder="Search by module title or instructor"
          fetching={fetching}
        />

        <UserSearch
          role={1} // role 1 = instructor
          value={params?.instructorId as string}
          onChange={(value) =>
            handleFilter({ instructorId: value || undefined })
          }
          placeholder="Search Instructor"
          currentUserName={
            (params?.instructorId as { name?: string } | null)?.name
          }
        />

        <CategorySearch
          value={params?.category as string}
          onChange={(value) => handleFilter({ category: value || undefined })}
          placeholder="Search Category"
        />

        <LanguageSelector
          value={params?.language as string}
          onLanguageSelect={(code) =>
            handleFilter({ language: code || undefined })
          }
        />

        <LevelSelector
          value={params?.level as string}
          levels={levels}
          onLevelSelect={(id) => handleFilter({ level: id || undefined })}
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

      <Flex gap="2" justify="start" align="center">
        <GoBack />
        <Link href="/admin/module/create">
          <Button className="!cursor-pointer">
            <FaPlus />
            Create Module
          </Button>
        </Link>
        <Button onClick={handleRefresh} className="!cursor-pointer">
          <MdRefresh size={20} className={fetching ? "animate-spin" : ""} />
          Refresh
        </Button>
        <Button
          variant="danger-outline"
          onClick={() => clearFilters()}
          className="!cursor-pointer"
        >
          <FaTrashAlt />
          Clear Filters
        </Button>
      </Flex>
    </Flex>
  );
}
