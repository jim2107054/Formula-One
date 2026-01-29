import Link from "next/link";
import { Flex } from "@radix-ui/themes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdKeyboardBackspace, MdRefresh } from "react-icons/md";

import {
  SectionSearch,
  StatusSelector,
} from "@/app/(protected)/admin/_components/search-selector";
import SearchBar from "@/app/(protected)/admin/_components/searchbar/searchbar";
import { Button } from "../../_components/button";
import { statusOptions } from "@/zustand/types/status";
import GoBack from "@/components/common/go-back";

interface LessonManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  resetFilters: (preserve?: string[]) => void;
}

export default function LessonManagementHeader({
  fetching,
  params,
  handleFilter,
  handleRefresh,
  resetFilters,
}: LessonManagementHeaderProps) {
  const onSectionSelect = (id: string) => {
    handleFilter({ sectionId: id });
  };

  const onSearch = (q: string) => {
    handleFilter({ search: q });
  };

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap">
        <SearchBar
          value={String(params?.search || "")}
          onSearch={onSearch}
          placeholder="Search by lesson title or description"
          fetching={fetching}
        />
        <SectionSearch
          value={String(params?.sectionId || "")}
          onSelectSection={onSectionSelect}
          placeholder="Search by section"
          disabled={fetching}
          courseId={params?.courseId as string}
          currentSectionTitle={params?.sectionTitle as string}
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

      <Flex gap="2">
        <GoBack />
        <Link href={"/admin/section"}>
          <Button>
            <MdKeyboardBackspace />
            Back to Section
          </Button>
        </Link>
        <Link
          href={
            params?.courseId && params?.sectionId
              ? `/admin/lesson/create?courseId=${params.courseId}&sectionId=${params.sectionId}`
              : params?.courseId
              ? `/admin/lesson/create?courseId=${params.courseId}`
              : "/admin/lesson/create"
          }
        >
          <Button className="cursor-pointer">
            <FaPlus />
            Create Lesson
          </Button>
        </Link>
        <Button onClick={handleRefresh}>
          <MdRefresh size={20} className={fetching ? "animate-spin" : ""} />
          Refresh
        </Button>
        <Button
          variant="danger-outline"
          onClick={() => resetFilters()}
          className="cursor-pointer"
        >
          <FaTrashAlt />
          Clear Filters
        </Button>
      </Flex>
    </Flex>
  );
}
