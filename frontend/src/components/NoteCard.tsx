"use client";

import Link from "next/link";
import type { Note } from "@/lib/types";
import { formatRelativeDate } from "@/lib/dates";

export function NoteCard({ note }: { note: Note }) {
  const bg = note.category?.bg_color ?? "#f5f0e8";
  const preview =
    note.body.length > 120 ? `${note.body.slice(0, 120)}…` : note.body;

  return (
    <Link
      href={`/notes/${note.id}`}
      className="block rounded-2xl p-5 transition hover:brightness-[0.97]"
      style={{ backgroundColor: bg }}
    >
      <div className="mb-2 flex items-baseline gap-2 text-xs">
        <span className="font-semibold text-[#5c4a32]">
          {formatRelativeDate(note.updated_at)}
        </span>
        {note.category && (
          <span className="text-stone-500">{note.category.name}</span>
        )}
      </div>
      <h3 className="font-heading truncate text-lg font-bold text-[#3d3428]">
        {note.title || "Untitled"}
      </h3>
      {preview && (
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-stone-700">
          {preview}
        </p>
      )}
    </Link>
  );
}
