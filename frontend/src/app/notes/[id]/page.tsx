"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteEditor } from "@/components/NoteEditor";
import { deleteNote, getCategories, getNote, updateNote } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category, Note } from "@/lib/types";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const idParam = params.id;
  const noteId =
    typeof idParam === "string" ? Number.parseInt(idParam, 10) : NaN;

  const [categories, setCategories] = useState<Category[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const skipAutosave = useRef(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (Number.isNaN(noteId)) {
      setError("Invalid note");
      setNote(null);
      return;
    }
    let cancelled = false;
    setNote(null);
    setError(null);
    skipAutosave.current = true;
    (async () => {
      try {
        const [n, c] = await Promise.all([getNote(noteId), getCategories()]);
        if (cancelled) return;
        setNote(n);
        setTitle(n.title);
        setBody(n.body);
        setCategoryId(n.category?.id ?? null);
        setCategories(c);
        skipAutosave.current = true;
      } catch {
        if (!cancelled) setError("Could not load this note.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, noteId, router]);

  useEffect(() => {
    if (!note || Number.isNaN(noteId)) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      updateNote(noteId, {
        title,
        body,
        category: categoryId,
      })
        .then((updated) => setNote(updated))
        .catch(() => {});
    }, 1000);
    return () => window.clearTimeout(t);
  }, [title, body, categoryId, note, noteId]);

  const flushSave = useCallback(async () => {
    if (!note || Number.isNaN(noteId)) return;
    try {
      const updated = await updateNote(noteId, {
        title,
        body,
        category: categoryId,
      });
      setNote(updated);
    } catch {
      /* ignore */
    }
  }, [note, noteId, title, body, categoryId]);

  const onClose = useCallback(async () => {
    await flushSave();
    router.push("/dashboard");
  }, [flushSave, router]);

  const onDelete = useCallback(async () => {
    if (!note || Number.isNaN(noteId)) return;
    if (!window.confirm("Delete this note forever?")) return;
    try {
      await deleteNote(noteId);
      router.push("/dashboard");
    } catch {
      setError("Could not delete note.");
    }
  }, [note, noteId, router]);

  if (authLoading) return null;
  if (!isAuthenticated) return null;
  if (error || !note) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-4">
        <p className="text-stone-700">{error ?? "Loading…"}</p>
      </div>
    );
  }

  return (
    <NoteEditor
      note={note}
      categories={categories}
      title={title}
      body={body}
      categoryId={categoryId}
      onTitleChange={setTitle}
      onBodyChange={setBody}
      onCategoryChange={setCategoryId}
      onClose={onClose}
      onDelete={onDelete}
    />
  );
}
