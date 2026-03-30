"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { CowIllustration } from "@/components/illustrations/CowIllustration";
import { CactusIllustration } from "@/components/illustrations/CactusIllustration";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  const heading =
    mode === "signup" ? "Yay, New Friend!" : "Yay, You're Back!";
  const submitLabel = mode === "signup" ? "Sign Up" : "Login";
  const otherHref = mode === "signup" ? "/login" : "/signup";
  const otherPrompt =
    mode === "signup"
      ? "We're already friends!"
      : "Oops! I've never been here before";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4 py-12">
      <div className="mb-6">
        {mode === "signup" ? <CowIllustration /> : <CactusIllustration />}
      </div>
      <h1 className="font-heading mb-10 text-center text-3xl font-semibold text-[#3d3428]">
        {heading}
      </h1>
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        {error && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#b8956a] bg-transparent px-4 py-3 text-[#3d3428] placeholder:text-stone-400 outline-none focus:border-[#8b6914] focus:ring-1 focus:ring-[#8b6914]"
        />
        <input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          placeholder="Password"
          minLength={mode === "signup" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#b8956a] bg-transparent px-4 py-3 text-[#3d3428] placeholder:text-stone-400 outline-none focus:border-[#8b6914] focus:ring-1 focus:ring-[#8b6914]"
        />
        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full border border-[#3d3428] bg-transparent px-4 py-3 font-semibold text-[#3d3428] transition hover:bg-[#3d3428]/5 disabled:opacity-50"
          >
            {pending ? "Please wait…" : submitLabel}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        <Link
          href={otherHref}
          className="text-[#8b6914] underline decoration-[#c4a574] underline-offset-2 hover:text-[#5c4a32]"
        >
          {otherPrompt}
        </Link>
      </p>
    </div>
  );
}
