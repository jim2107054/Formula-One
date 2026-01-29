"use client";

import { cn } from "@/lib/utils";
import { Icon } from "../icon/Icon";

interface SectionTagProps {
  text?: string;
  icon?: string;
  status?: string;
  className?: string;
}

export default function SectionTag({
  text,
  icon,
  status = "default",
  className,
}: SectionTagProps) {
  return (
    <div
      className={cn(
        className,
        `px-4 py-2 rounded-sm flex items-center transition-all duration-300 ease-in-out space-x-2.5 ${
          status === "special"
            ? "bg-[var(--Orange-default)]"
            : status === "in-progress"
            ? "bg-[var(--Accent-default)]"
            : "bg-[var(--Accent-dark-2)]"
        }`
      )}
    >
      <Icon name={`${icon}`}></Icon>
      {text && <h2 className="font-bold text-white">{text}</h2>}
    </div>
  );
}
