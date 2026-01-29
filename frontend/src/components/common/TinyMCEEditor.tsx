"use client";

import dynamic from "next/dynamic";
import { memo, useRef } from "react";
import { Skeleton } from "@radix-ui/themes";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <Skeleton height="240px" width="100%" />,
  }
);

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const TinyMCEEditor = memo<TinyMCEEditorProps>(function TinyMCEEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 300,
}) {
  const editorRef = useRef<unknown>(null);

  const editorConfig = {
    height,
    menubar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | " +
      "bold italic backcolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | help",
    content_style:
      "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 0.5; }",
    placeholder,
    branding: false,
    skin: "oxide",
    content_css: false,
  };

  return (
    <Editor
      tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`}
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      value={value}
      onEditorChange={onChange}
      init={editorConfig}
    />
  );
});

export default TinyMCEEditor;
