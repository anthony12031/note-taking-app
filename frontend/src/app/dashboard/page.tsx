"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategorySidebar } from "@/components/CategorySidebar";
import { EmptyState } from "@/components/EmptyState";
import { NoteCard } from "@/components/NoteCard";
import { createNote, getCategories, getNotes } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category, Note } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all"
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [c, n] = await Promise.all([getCategories(), getNotes()]);
        if (!cancelled) {
          setCategories(c);
          setNotes(n);
        }
      } catch {
        if (!cancelled) setLoadError("Could not load your notes.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router]);

  const filteredNotes = useMemo(() => {
    if (selectedCategoryId === "all") return notes;
    return notes.filter((n) => n.category?.id === selectedCategoryId);
  }, [notes, selectedCategoryId]);

  const onNewNote = useCallback(async () => {
    setCreating(true);
    try {
      const defaultCat = categories[0]?.id ?? null;
      const note = await createNote({
        title: "",
        body: "",
        category: defaultCat,
      });
      router.push(`/notes/${note.id}`);
    } finally {
      setCreating(false);
    }
  }, [categories, router]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      <CategorySidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onLogout={logout}
      />
      <main className="relative flex min-w-0 flex-1 flex-col p-6">
        <div className="absolute right-6 top-6 z-10">
          <button
            type="button"
            onClick={onNewNote}
            disabled={creating}
            className="rounded-xl border-2 border-[#8b6914] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#5c4a32] shadow-sm transition hover:bg-white disabled:opacity-50"
          >
            + New Note
          </button>
        </div>
        <div className="flex-1 pt-12">
          {loadError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              {loadError}
            </p>
          )}
          {!loadError && notes.length === 0 && <EmptyState />}
          {!loadError && notes.length > 0 && filteredNotes.length === 0 && (
            <p className="pt-20 text-center text-stone-600">
              No notes in this category yet.
            </p>
          )}
          {!loadError && filteredNotes.length > 0 && (
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
