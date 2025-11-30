"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiUser } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Guest sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(12,154,235,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(3,67,105,0.55),_transparent_65%)]" />

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="glass-surface w-full max-w-md rounded-3xl border border-white/40 p-10 shadow-xl dark:border-white/5 dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-custom-color-900 dark:text-white">
              Sceneblikk
            </h1>
            <p className="mt-2 text-sm text-custom-color-700/80 dark:text-custom-color-100/75">
              {isSignUp
                ? "Create an account to get started"
                : "Sign in to access your layouts"}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-custom-color-800 dark:text-custom-color-100"
              >
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-custom-color-500 dark:text-custom-color-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/50 px-10 py-3 text-sm text-custom-color-900 placeholder-custom-color-500/60 transition focus:border-custom-color-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-custom-color-400/30 dark:border-white/10 dark:bg-custom-color-800/50 dark:text-white dark:placeholder-custom-color-300/50 dark:focus:border-custom-color-300 dark:focus:bg-custom-color-800/70"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-semibold text-custom-color-800 dark:text-custom-color-100"
                >
                  Name (optional)
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-custom-color-500 dark:text-custom-color-300" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/50 px-10 py-3 text-sm text-custom-color-900 placeholder-custom-color-500/60 transition focus:border-custom-color-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-custom-color-400/30 dark:border-white/10 dark:bg-custom-color-800/50 dark:text-white dark:placeholder-custom-color-300/50 dark:focus:border-custom-color-300 dark:focus:bg-custom-color-800/70"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-custom-color-800 dark:text-custom-color-100"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-custom-color-500 dark:text-custom-color-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/20 bg-white/50 px-10 py-3 text-sm text-custom-color-900 placeholder-custom-color-500/60 transition focus:border-custom-color-400 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-custom-color-400/30 dark:border-white/10 dark:bg-custom-color-800/50 dark:text-white dark:placeholder-custom-color-300/50 dark:focus:border-custom-color-300 dark:focus:bg-custom-color-800/70"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-custom-color-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 disabled:opacity-50 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
            >
              {loading ? (
                "Please wait…"
              ) : isSignUp ? (
                <>
                  <FiUserPlus className="mr-2 inline h-4 w-4" />
                  Create account
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2 inline h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full rounded-full border border-custom-color-400 bg-transparent px-5 py-3 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/40 disabled:opacity-50 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
            >
              Continue as guest
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm text-custom-color-600 underline transition hover:text-custom-color-500 dark:text-custom-color-200 dark:hover:text-custom-color-100"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

