import { Tooltip as RadixTooltip } from "@radix-ui/themes";
import { ReactNode } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";

interface TooltipProps {
  content: ReactNode;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

export default function InstructionTooltip({
  content,
  className = "",
  iconSize = "sm",
}: TooltipProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <RadixTooltip content={content}>
      <button
        type="button"
        aria-label="More information"
        className={`!cursor-pointer ${className}`}
      >
        <FaRegQuestionCircle className={sizeClasses[iconSize]} color="gray" />
      </button>
    </RadixTooltip>
  );
}
