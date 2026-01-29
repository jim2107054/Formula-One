"use client";

import { PageSizeSelector } from "@/components/common/pagination";
import { Pagination } from "@/components/ui";
import { Flex } from "@radix-ui/themes";

interface TablePaginationProps {
  totalItems: number;
  itemsPerPage: 10 | 20 | 50 | 100;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: 10 | 20 | 50 | 100) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  className = "",
}) => {
  if (totalItems === 0) return null;

  return (
    <Flex justify="between" className={`mt-4 ${className}`}>
      <PageSizeSelector value={itemsPerPage} onChange={onPageSizeChange} />
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </Flex>
  );
};
