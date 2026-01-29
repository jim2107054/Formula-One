import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";
import { Flex } from "@radix-ui/themes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdKeyboardBackspace, MdRefresh } from "react-icons/md";

import SearchBar from "@/app/(protected)/admin/_components/searchbar/searchbar";
import {
  ItemTypeSelector,
  LessonSearch,
  StatusSelector,
} from "@/app/(protected)/admin/_components/search-selector";
import { Button } from "@/app/(protected)/admin/_components/button";
import { statusOptions } from "@/zustand/types/status";
import GoBack from "@/components/common/go-back";
import ItemResourceTypeSelector from "../../_components/search-selector/item-resource-type-selector";
import { ItemResourceMediaType, ItemType } from "@/zustand/types/item";

interface ItemManagementHeaderProps {
  fetching?: boolean;
  params: Record<string, unknown>;
  searchParams: ReadonlyURLSearchParams;
  handleRefresh: () => void;
  handleFilter: (filters: Record<string, unknown>) => void;
  clearFilters: (preserve?: string[]) => void;
}

export default function ItemManagementHeader({
  fetching,
  params,
  searchParams,
  handleFilter,
  handleRefresh,
  clearFilters,
}: ItemManagementHeaderProps) {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap">
        <SearchBar
          value={String(params.search || "")}
          onSearch={(q) => handleFilter({ search: q })}
          placeholder="Search by title or content"
          fetching={fetching}
        />
        <LessonSearch
          value={String(params.lessonId || "")}
          onSelectLesson={(id) => handleFilter({ lessonId: id })}
          placeholder="Search by lesson"
          disabled={fetching}
          sectionId={params?.sectionId as string}
          courseId={params?.courseId as string}
          currentLessonTitle={params?.lessonTitle as string}
        />
        <ItemTypeSelector
          value={params.type as ItemType}
          onChange={(value) =>
            handleFilter({
              type: value,
              mediaType: value === "resource" ? params.mediaType : undefined,
            })
          }
        />
        <ItemResourceTypeSelector
          itemType={params.type as ItemType}
          value={params.mediaType as ItemResourceMediaType}
          onChange={(value) => handleFilter({ mediaType: value })}
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
        <Link href="/admin/lesson">
          <Button>
            <MdKeyboardBackspace />
            Back to Lesson
          </Button>
        </Link>
        <Link href={`/admin/item/create?${searchParams}`}>
          <Button className="cursor-pointer">
            <FaPlus />
            Create Item
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
