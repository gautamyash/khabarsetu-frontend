"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

/** Simple free-text tag input: type a tag, press Enter/comma to add it,
 * click the x (or Backspace on an empty draft) to remove the last one. */
export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    setDraft("");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-sm border border-ink-200 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-sm bg-ink-100 px-2 py-1 text-xs text-ink-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`"${tag}" टैग हटाएं`}
            className="text-ink-400 hover:text-brand-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length === 0 ? "टैग जोड़ें और Enter दबाएं..." : ""}
        className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm text-ink-900 outline-none focus:ring-0"
      />
    </div>
  );
}
