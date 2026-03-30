"use client";

import type { Category, Note } from "@/lib/types";
import { formatLastEdited } from "@/lib/dates";
import { CategoryDropdown } from "@/components/CategoryDropdown";

type Props = {
  note: Note;
  categories: Category[];
  title: string;
  body: string;
  categoryId: number | null;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onCategoryChange: (id: number | null) => void;
  onClose: () => void;
  onDelete: () => void;
};

export function NoteEditor({
  note,
  categories,
  title,
  body,
  categoryId,
  onTitleChange,
  onBodyChange,
  onCategoryChange,
  onClose,
  onDelete,
}: Props) {
  const cat =
    categoryId === null
      ? null
      : (categories.find((c) => c.id === categoryId) ?? note.category);
  const bg = cat?.bg_color ?? note.category?.bg_color ?? "#FFF8F0";

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: bg }}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 px-4 py-3 sm:px-6">
        <CategoryDropdown
          categories={categories}
          value={categoryId}
          onChange={onCategoryChange}
        />
        <p className="hidden flex-1 text-right text-sm text-stone-700 sm:block">
          {formatLastEdited(note.updated_at)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-800 hover:bg-red-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border-2 border-[#8b6914] text-lg font-medium text-[#5c4a32] hover:bg-white/40"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </header>
      <p className="px-4 py-2 text-center text-xs text-stone-600 sm:hidden">
        {formatLastEdited(note.updated_at)}
      </p>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-8 pt-2 sm:px-10 sm:pt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Note Title"
          className="mb-4 w-full border-none bg-transparent font-heading text-3xl font-bold text-[#3d3428] placeholder:text-stone-400 focus:outline-none focus:ring-0 sm:text-4xl"
        />
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Pour your heart out..."
          className="min-h-[50vh] w-full flex-1 resize-none border-none bg-transparent text-lg leading-relaxed text-[#3d3428] placeholder:text-stone-400 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
