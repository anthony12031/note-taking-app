"use client";

import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  selectedCategoryId: number | "all";
  onSelectCategory: (id: number | "all") => void;
  onLogout?: () => void;
};

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onLogout,
}: Props) {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#e8d4c4] bg-white/40 px-5 py-6">
      <button
        type="button"
        onClick={() => onSelectCategory("all")}
        className={`font-heading mb-5 text-left text-base font-semibold transition ${
          selectedCategoryId === "all"
            ? "text-[#3d3428]"
            : "text-stone-400 hover:text-[#3d3428]"
        }`}
      >
        All Categories
      </button>
      <nav className="flex flex-1 flex-col gap-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCategory(c.id)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
              selectedCategoryId === c.id
                ? "bg-[#fff3e0] font-medium text-[#5c4a32]"
                : "text-stone-700 hover:bg-[#fff8f0]"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              <span className="truncate">{c.name}</span>
            </span>
            <span className="shrink-0 text-xs text-stone-400">{c.note_count}</span>
          </button>
        ))}
      </nav>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="mt-auto pt-4 text-left text-xs text-stone-400 hover:text-stone-600 transition"
        >
          Log out
        </button>
      )}
    </aside>
  );
}
