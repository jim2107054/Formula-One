"use client";

import Image from "next/image";

export default function ImageItem({ url }: { url: string }) {
  return (
    <div className="w-full flex justify-center my-20">
      <Image
        src={url}
        alt="Lesson Item"
        className="max-w-full h-auto rounded-lg"
        width={800}
        height={600}
      />
    </div>
  );
}
