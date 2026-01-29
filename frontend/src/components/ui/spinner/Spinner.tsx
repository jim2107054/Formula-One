"use client";

import { cn } from "@/lib/utils";
import { ImSpinner3 } from "react-icons/im";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <ImSpinner3
      className={cn(className, "text-white size-5 animate-spin m-1")}
    />
  );
}
