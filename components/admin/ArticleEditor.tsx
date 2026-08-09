"use client";

import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo, Undo } from "lucide-react";

/**
 * Rich text editor for "समाचार सामग्री" (article content), built on the
 * already-installed TipTap packages. StarterKit (v3) already bundles
 * paragraph/heading/bold/italic/link/bulletList/orderedList/blockquote/
 * undo-redo, so only Placeholder is added separately — adding a second,
 * standalone Link extension on top of StarterKit's built-in one would
 * register the "link" extension twice and throw at runtime.
 */
export function ArticleEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { class: "text-brand-700 underline underline-offset-2" },
        },
      }),
      Placeholder.configure({ placeholder: "समाचार सामग्री लिखें..." }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[360px] px-4 py-4 text-[15px] leading-relaxed text-ink-900 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[280px] animate-pulse rounded-sm border border-ink-200 bg-ink-50" />
    );
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("लिंक URL दर्ज करें:", previousUrl);
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rounded-sm border border-ink-200 bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      <div className="flex flex-wrap items-center gap-1 rounded-t-sm border-b border-ink-200 bg-ink-50/60 px-2 py-1.5">
        <ToolbarButton
          label="बोल्ड"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="इटैलिक"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="शीर्षक"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="बुलेट सूची"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="क्रमांकित सूची"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="उद्धरण"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="लिंक" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden />
        <ToolbarButton label="पूर्ववत करें" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="फिर से करें" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={Boolean(active)}
      className={`rounded-sm p-1.5 transition-colors hover:bg-ink-100 ${
        active ? "bg-ink-100 text-brand-700" : "text-ink-600"
      }`}
    >
      {children}
    </button>
  );
}
