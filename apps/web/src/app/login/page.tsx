"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error: authError } = await action;
    setPending(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace(mode === "signup" ? "/onboarding" : "/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Nutri-Stacker</p>
      <h1 className="mt-3 text-3xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-card px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-card px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
