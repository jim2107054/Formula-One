"use client";

import { usePagination } from "@/hooks/usePagination";
import { Button, Flex, Text } from "@radix-ui/themes";
import React, { useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: 10 | 20 | 50 | 100;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}) => {
  const { params } = usePagination();

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const raw = Number(params.page ?? 1);
  const page = Math.max(1, Math.min(raw, totalPages));

  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const list: (number | string)[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) list.push("...");
    list.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i));
    if (end < totalPages - 1) list.push("...");
    list.push(totalPages);

    return list;
  }, [totalPages, page]);

  if (totalItems === 0) return null;

  const goFirst = () => onPageChange(1);
  const goPrev = () => onPageChange(page - 1);
  const goNext = () => onPageChange(page + 1);
  const goLast = () => onPageChange(totalPages);

  return (
    <Flex direction="row" gap="2" className={className}>
      <Button
        variant="soft"
        color="cyan"
        className={`hidden lg:flex ${
          page === 1 ? "cursor-not-allowed" : "!cursor-pointer"
        }`}
        onClick={goFirst}
        disabled={page === 1}
      >
        <FiChevronsLeft className="size-4" />
      </Button>

      <Button
        variant="soft"
        color="cyan"
        onClick={goPrev}
        disabled={page === 1}
        className={page === 1 ? "cursor-not-allowed" : "!cursor-pointer"}
      >
        <FiChevronLeft className="size-4" />
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <Text key={i} size="1" className="p-1">
            ...
          </Text>
        ) : (
          <Button
            key={i}
            variant={p === page ? "solid" : "soft"}
            color="cyan"
            onClick={() => onPageChange(p as number)}
            className="!cursor-pointer"
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="soft"
        color="cyan"
        onClick={goNext}
        disabled={page === totalPages}
        className={
          page === totalPages ? "cursor-not-allowed" : "!cursor-pointer"
        }
      >
        <FiChevronRight className="size-4" />
      </Button>

      <Button
        variant="soft"
        color="cyan"
        className={`hidden lg:flex ${
          page === totalPages ? "cursor-not-allowed" : "!cursor-pointer"
        }`}
        onClick={goLast}
        disabled={page === totalPages}
      >
        <FiChevronsRight className="size-4" />
      </Button>
    </Flex>
  );
};
