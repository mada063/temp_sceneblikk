"use client";

import Link from "next/link";
import {
  FiLayout,
  FiBarChart2,
  FiMonitor,
  FiPlayCircle,
  FiGrid,
} from "react-icons/fi";
import { useI18n } from "../lib/i18n";

const workflow = [
  {
    title: "Define the canvas",
    description:
      "Enter your screen dimensions in inches and set the grid density that best fits your content strategy.",
    icon: FiGrid,
  },
  {
    title: "Place components",
    description:
      "Drag and drop reusable content blocks onto the grid. Resize cells or swap components in seconds.",
    icon: FiLayout,
  },
  {
    title: "Publish to screens",
    description:
      "Use the player view to project layouts to every device and track what’s live from the dashboard.",
    icon: FiPlayCircle,
  },
];

export function HomeClient() {
  const { t } = useI18n();

  const quickLinks = [
    {
      href: "/editor",
      label: t("home", "startEditing"),
      icon: FiLayout,
      description:
        "Design responsive signage layouts with inch-perfect grids.",
    },
    {
      href: "/dashboard",
      label: t("home", "openDashboard"),
      icon: FiBarChart2,
      description: "Monitor screens, view updates, and track engagement.",
    },
    {
      href: "/view",
      label: t("home", "launchPlayer"),
      icon: FiMonitor,
      description: "Preview the full-screen signage player experience.",
    },
  ];

  return (
    <main className="relative max-h-screen overflow-hidden bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(12,154,235,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(3,67,105,0.55),_transparent_65%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-24 sm:px-10 lg:px-16">
        <section className="glass-surface rounded-3xl border border-white/40 p-10 shadow-xl dark:border-white/5 dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-custom-color-300/30 bg-custom-color-50/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 dark:border-white/10 dark:bg-custom-color-900/50 dark:text-custom-color-200">
                Sceneblikk Signage
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("home", "title")}
              </h1>
              <p className="text-base leading-relaxed text-custom-color-800/80 dark:text-custom-color-100/85">
                {t("home", "subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                {quickLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full bg-custom-color-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="glass-surface-strong w-full max-w-sm rounded-2xl border border-white/30 p-6 text-sm text-custom-color-900 shadow-lg dark:border-white/10 dark:text-custom-color-50">
              <h2 className="mb-4 text-lg font-semibold text-custom-color-700 dark:text-custom-color-100">
                Why digital signage teams choose Sceneblikk
              </h2>
              <ul className="space-y-4 text-sm leading-relaxed">
                <li>
                  <strong className="font-semibold">Grid-first editing:</strong>{" "}
                  author layouts for every screen ratio in minutes.
                </li>
                <li>
                  <strong className="font-semibold">Theme-aware visuals:</strong>{" "}
                  colors adapt automatically to every viewer’s environment.
                </li>
                <li>
                  <strong className="font-semibold">Playback ready:</strong>{" "}
                  launch the player view with a single click to go full screen.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {quickLinks.map(({ href, label, icon: Icon, description }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-6 text-custom-color-900 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-custom-color-800/70 dark:text-white"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-custom-color-100/40 via-transparent to-custom-color-300/35 opacity-0 transition group-hover:opacity-100 dark:from-custom-color-700/25 dark:to-custom-color-500/35" />
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-custom-color-500/15 p-3 text-custom-color-600 dark:bg-custom-color-400/20 dark:text-custom-color-200">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold">{label}</h3>
              <p className="mt-2 text-sm text-custom-color-700/80 dark:text-custom-color-100/75">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-500 dark:text-custom-color-200">
                {t("home", "explore")}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}


