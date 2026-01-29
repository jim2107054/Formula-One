import React from "react";
import { Table } from "@radix-ui/themes";

interface InteractiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  isLastInteracted?: boolean;
}

export const InteractiveTableRow = ({
  children,
  className = "",
  isLastInteracted = false,
}: InteractiveTableRowProps) => {
  return (
    <Table.Row
      className={`hover:bg-[var(--Primary-light)] transition-colors duration-150 ${
        isLastInteracted ? "bg-pressed-bg" : ""
      } ${className}`}
    >
      {children}
    </Table.Row>
  );
};
