"use client";
export default function AudioItem({ url }: { url: string }) {
  return (
    <div className="my-20">
      <audio src={url} controls className="w-full"></audio>
    </div>
  );
}
