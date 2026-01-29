"use client";

import { Button } from "@/components/ui";
import Link from "next/link";
import { BiLinkExternal } from "react-icons/bi";

export default function LinkItem({
  url,
  title = "",
}: {
  url: string;
  title: string;
}) {
  return (
    <div className="my-10 w-full rounded-lg bg-[var(--Primary-light)] flex flex-col items-center justify-center space-y-6 py-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="mt-2">
          You are about to referring to an external website.
        </p>
      </div>
      <Link target="_blank" href={url}>
        <Button endIcon={<BiLinkExternal />} className="max-w-[278px]">
          Go to external link
        </Button>
      </Link>
    </div>
  );
}
