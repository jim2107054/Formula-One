"use client";

import { Icon } from "../ui";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex justify-center items-center min-h-screen ${className}`}
    >
      <div className={`relative `}>
        <Icon
          name="circle-loading"
          className={`animate-spin size-14 md:size-20`}
        ></Icon>
        <Icon
          name="brain"
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-7 md:size-10`}
        ></Icon>
      </div>
    </div>
  );
}
