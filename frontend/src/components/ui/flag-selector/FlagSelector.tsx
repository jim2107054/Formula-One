"use client";

import Image from "next/image";

export default function FlagSelector({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const flags: Record<string, string> = {
    English: "GB",
    German: "DE",
    Spanish: "ES",
    Romanian: "RO",
  };
  return (
    <div>
      <Image
        src={`/images/flags/${flags[name]}.svg`}
        alt="flag icon"
        width={28}
        height={28}
        className={className}
      />
    </div>
  );
}
