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
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    
    // If user is authenticated and on login page, redirect to dashboard
    if (user && isLoginPage) {
      router.replace("/dashboard");
      return;
    }
    
    // If user is not authenticated and trying to access protected route, redirect to login
    if (!user && !isPublic) {
      router.replace("/login");
    }
  }, [user, loading, isPublic, isLoginPage, router]);

  // Show loading state while checking authentication
  if (loading) {
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

  // Allow public routes (home page and login page)
  if (isPublic) {
    return <>{children}</>;
  }

  // If not authenticated and trying to access protected route, show loading (redirect will happen)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
        <div className="glass-surface rounded-3xl border border-white/30 px-8 py-6 text-center shadow-lg dark:border-white/10">
          <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/75">
            Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, allow access
  return <>{children}</>;
}


