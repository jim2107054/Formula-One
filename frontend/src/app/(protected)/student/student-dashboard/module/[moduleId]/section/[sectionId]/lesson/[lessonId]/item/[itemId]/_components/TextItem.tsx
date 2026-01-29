"use client";
export default function TextItem({ text }: { text: string }) {
  return (
    <div
      className="bg-[var(--Primary-light)] px-4 md:px-12 py-8 rounded-lg my-12"
      dangerouslySetInnerHTML={{ __html: text }}
    ></div>
  );
}
