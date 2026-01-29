"use client";

import { Box, Flex, Separator } from "@radix-ui/themes";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { memo, useCallback, useEffect } from "react";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaCode,
  FaHighlighter,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const TipTapEditor = memo<TipTapEditorProps>(function TipTapEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 300,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();

    const normalizedValue = value?.trim() || "";
    const normalizedCurrent = currentContent?.trim() || "";

    if (normalizedValue !== normalizedCurrent && !editor.isFocused) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("Image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Box
      style={{
        border: "1px solid var(--gray-6)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Flex
        gap="1"
        p="2"
        wrap="wrap"
        style={{
          backgroundColor: "var(--gray-2)",
          borderBottom: "1px solid var(--gray-6)",
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <FaUndo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <FaRedo />
        </ToolbarButton>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : editor.isActive("heading", { level: 4 })
              ? "4"
              : editor.isActive("heading", { level: 5 })
              ? "5"
              : editor.isActive("heading", { level: 6 })
              ? "6"
              : "0"
          }
          style={{
            padding: "4px 8px",
            border: "1px solid var(--gray-6)",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "var(--color-background)",
          }}
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <FaBold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <FaItalic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <FaUnderline />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <FaStrikethrough />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Highlight"
        >
          <FaHighlighter />
        </ToolbarButton>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <FaAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <FaAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <FaAlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <FaAlignJustify />
        </ToolbarButton>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <FaListUl />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <FaListOl />
        </ToolbarButton>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <FaQuoteLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code block"
        >
          <FaCode />
        </ToolbarButton>

        <Separator orientation="vertical" style={{ height: "24px" }} />
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Add link"
        >
          <FaLink />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add image">
          <FaImage />
        </ToolbarButton>
      </Flex>

      <Box
        style={{
          height: `${height}px`,
          overflowY: "auto",
          padding: "12px",
        }}
      >
        <EditorContent editor={editor} />
      </Box>
      <style jsx global>{`
        .tiptap-editor {
          outline: none !important;
          min-height: ${height - 24}px;
        }

        .tiptap-editor > * {
          all: revert;
        }

        .tiptap-editor p {
          margin: 0 0 1em 0 !important;
        }

        .tiptap-editor p:last-child {
          margin-bottom: 0 !important;
        }

        .tiptap-editor h1,
        .tiptap-editor h2,
        .tiptap-editor h3,
        .tiptap-editor h4,
        .tiptap-editor h5,
        .tiptap-editor h6 {
          line-height: 1.3 !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          font-weight: bold !important;
        }

        .tiptap-editor h1 {
          font-size: 2em !important;
        }

        .tiptap-editor h2 {
          font-size: 1.5em !important;
        }

        .tiptap-editor h3 {
          font-size: 1.25em !important;
        }

        .tiptap-editor h4 {
          font-size: 1.1em !important;
        }

        .tiptap-editor h5 {
          font-size: 1em !important;
        }

        .tiptap-editor h6 {
          font-size: 0.9em !important;
        }

        .tiptap-editor ul,
        .tiptap-editor ol {
          padding-left: 1.5em !important;
          margin: 0.5em 0 !important;
        }

        .tiptap-editor li {
          margin: 0.25em 0 !important;
        }

        .tiptap-editor ul {
          list-style-type: disc !important;
        }

        .tiptap-editor ol {
          list-style-type: decimal !important;
        }

        .tiptap-editor blockquote {
          border-left: 3px solid var(--gray-6) !important;
          padding-left: 1em !important;
          margin: 1em 0 !important;
          font-style: italic !important;
        }

        .tiptap-editor code {
          background-color: var(--gray-3) !important;
          padding: 0.2em 0.4em !important;
          border-radius: 3px !important;
          font-family: monospace !important;
          font-size: 0.9em !important;
        }

        .tiptap-editor pre {
          background-color: var(--gray-3) !important;
          padding: 1em !important;
          border-radius: 4px !important;
          overflow-x: auto !important;
          margin: 1em 0 !important;
        }

        .tiptap-editor pre code {
          background: none !important;
          padding: 0 !important;
        }

        .tiptap-editor mark {
          background-color: #fef08a !important;
          padding: 0.1em 0.2em !important;
          border-radius: 2px !important;
        }

        .tiptap-editor a.tiptap-link {
          color: var(--accent-9) !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        .tiptap-editor img.tiptap-image {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 4px !important;
          margin: 0.5em 0 !important;
        }

        .tiptap-editor .ProseMirror-placeholder {
          color: var(--gray-9) !important;
          pointer-events: none !important;
          height: 0 !important;
        }

        .tiptap-editor .ProseMirror-placeholder::before {
          content: attr(data-placeholder) !important;
          float: left !important;
          height: 0 !important;
          pointer-events: none !important;
        }

        /* Ensure proper text alignment */
        .tiptap-editor [style*="text-align: left"] {
          text-align: left !important;
        }

        .tiptap-editor [style*="text-align: center"] {
          text-align: center !important;
        }

        .tiptap-editor [style*="text-align: right"] {
          text-align: right !important;
        }

        .tiptap-editor [style*="text-align: justify"] {
          text-align: justify !important;
        }
      `}</style>
    </Box>
  );
});

function ToolbarButton({
  onClick,
  disabled = false,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "6px 8px",
        border: "1px solid var(--gray-6)",
        borderRadius: "4px",
        backgroundColor: isActive
          ? "var(--accent-3)"
          : "var(--color-background)",
        color: isActive ? "var(--accent-11)" : "var(--gray-12)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = isActive
            ? "var(--accent-4)"
            : "var(--gray-3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isActive
          ? "var(--accent-3)"
          : "var(--color-background)";
      }}
    >
      {children}
    </button>
  );
}

export default TipTapEditor;
