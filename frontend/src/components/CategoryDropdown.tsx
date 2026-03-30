"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
};

export function CategoryDropdown({ categories, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    value === null
      ? null
      : (categories.find((c) => c.id === value) ?? null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border-2 border-[#c4a574] bg-white px-4 py-2 text-sm font-medium text-[#3d3428] shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {current ? (
          <>
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: current.color }}
              aria-hidden
            />
            {current.name}
          </>
        ) : (
          <span className="text-stone-500">No category</span>
        )}
        <span className="text-stone-400" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-[#e0d5c8] bg-white py-1 shadow-lg"
          role="listbox"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[#fff8f0]"
            >
              <span className="size-2.5 rounded-full bg-stone-300" aria-hidden />
              No category
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[#fff8f0]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                />
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
