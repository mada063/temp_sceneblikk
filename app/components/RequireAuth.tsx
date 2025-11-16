"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/auth-context";

type RequireAuthProps = {
  children: ReactNode;
};

const PUBLIC_ROUTES = new Set<string>(["/", "/login"]);

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.has(pathname ?? "");

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace("/login");
    }
  }, [user, loading, isPublic, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading || (!user && !isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
        <div className="glass-surface rounded-3xl border border-white/30 px-8 py-6 text-center shadow-lg dark:border-white/10">
          <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


