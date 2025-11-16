"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiClock,
  FiEye,
  FiGlobe,
  FiLayers,
  FiMonitor,
  FiPlusCircle,
} from "react-icons/fi";
import { useAuth } from "../lib/auth-context";
import { subscribeToUserDevices, getUserLayouts, type DeviceStatus, type SavedLayout } from "../lib/firestore";

type RecentEdit = {
  id: string;
  title: string;
  editor: string;
  timestamp: string;
};

const chartData = [34, 64, 49, 92, 76, 88, 120, 105, 140, 125, 160, 182];
const playbackHealth = [
  { title: "Live playback", value: 92, accent: "from-custom-color-400 to-custom-color-300" },
  { title: "Pending sync", value: 6, accent: "from-amber-200/90 to-amber-400/60" },
  { title: "Alerts", value: 2, accent: "from-rose-200/90 to-rose-400/60" },
];

const statusStyles: Record<string, string> = {
  online: "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40",
  offline: "bg-rose-500/20 text-rose-200 border border-rose-400/40",
  standby: "bg-amber-400/20 text-amber-200 border border-amber-400/40",
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "online":
      return "Live";
    case "offline":
      return "Offline";
    case "standby":
      return "Standby";
    default:
      return "Unknown";
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [recentEdits, setRecentEdits] = useState<RecentEdit[]>([]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to device updates
    const unsubscribe = subscribeToUserDevices(user.uid, (updatedDevices) => {
      setDevices(updatedDevices);
    });

    // Load recent layouts as "edits"
    getUserLayouts(user.uid).then((layouts) => {
      setRecentEdits(
        layouts.slice(0, 4).map((layout) => ({
          id: layout.id,
          title: layout.name,
          editor: user.email?.split("@")[0] || "User",
          timestamp: `Edited ${formatTimeAgo(layout.updatedAt)}`,
        })),
      );
    });

    return () => unsubscribe();
  }, [user]);

  const maxChartValue = useMemo(
    () => Math.max(...chartData, 1),
    [],
  );

  // Filter devices by status and determine if they're online (heartbeat within last 2 minutes)
  const activeDevices = useMemo(() => {
    return devices
      .map((device) => {
        const timeSinceHeartbeat = Date.now() - device.lastHeartbeat.getTime();
        const isRecentlyActive = timeSinceHeartbeat < 120000; // 2 minutes
        const effectiveStatus = isRecentlyActive ? device.status : "offline";
        return { ...device, effectiveStatus, timeSinceHeartbeat };
      })
      .filter((device) => device.effectiveStatus !== "offline" || device.isFullscreen);
  }, [devices]);

  return (
    <div className="min-h-screen bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-custom-color-600 dark:text-custom-color-200">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Playback operations overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-custom-color-700/80 dark:text-custom-color-100/75">
              Monitor every live screen, spot stale content, and keep signage running flawlessly.
            </p>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-full bg-custom-color-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
          >
            <FiPlusCircle className="h-4 w-4" />
            Create new layout
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
                Active views
              </h2>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 transition hover:border-white/40 hover:bg-white/20 dark:text-custom-color-100"
              >
                <FiEye className="h-3.5 w-3.5" />
                View reports
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {activeDevices.length === 0 ? (
                <div className="rounded-2xl border border-white/15 bg-white/80 p-6 text-center dark:border-white/10 dark:bg-custom-color-800/70">
                  <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                    No active devices. Open the player view in fullscreen to see device status here.
                  </p>
                </div>
              ) : (
                activeDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/80 p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-custom-color-800/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-custom-color-900 dark:text-white">
                        {device.deviceName}
                      </p>
                      <p className="text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
                        Device ID: {device.id.substring(0, 12)}...
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold uppercase tracking-[0.2em] ${statusStyles[device.effectiveStatus] || statusStyles.offline}`}
                        >
                          <FiMonitor className="h-3 w-3" />
                          {getStatusLabel(device.effectiveStatus)}
                        </span>
                        {device.layoutName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-custom-color-700 dark:bg-custom-color-700/60 dark:text-custom-color-100/80">
                            <FiLayers className="h-3 w-3" />
                            {device.layoutName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-custom-color-700/70 dark:text-custom-color-100/70">
                      <p>
                        {device.isFullscreen ? "Fullscreen" : "Windowed"} · {formatTimeAgo(device.lastHeartbeat)}
                      </p>
                      <Link
                        href={`/view?layoutId=${device.layoutId || ""}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-500 transition hover:text-custom-color-400 dark:text-custom-color-200 dark:hover:text-custom-color-100"
                      >
                        Inspect view →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
            <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
              Latest edits
            </h2>
            <div className="mt-4 space-y-4">
              {recentEdits.map((edit) => (
                <div
                  key={edit.id}
                  className="rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm transition hover:shadow-md dark:bg-custom-color-800/70"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-custom-color-900 dark:text-white">
                      {edit.title}
                    </p>
                    <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-custom-color-700/70 dark:text-custom-color-100/70">
                      <FiClock className="h-3 w-3" />
                      {edit.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-custom-color-700/80 dark:text-custom-color-100/60">
                    {edit.editor}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/editor"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/50 dark:border-custom-color-300/40 dark:text-custom-color-50 dark:hover:bg-custom-color-700/40"
            >
              <FiActivity className="h-4 w-4" />
              Review change log
            </Link>
          </div>
        </section>

        <section className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
                Audience engagement
              </h2>
              <p className="text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
                Impressions across primary display locations (last 12 hours)
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 dark:bg-custom-color-800/70 dark:text-custom-color-100">
              <FiGlobe className="h-3.5 w-3.5" />
              Live sync
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col justify-end gap-2 rounded-2xl border border-white/15 bg-white/70 p-6 dark:bg-custom-color-800/70">
              <div className="flex h-48 items-end gap-3">
                {chartData.map((value, index) => (
                  <div key={index} className="group flex w-full flex-col justify-end text-center">
                    <div
                      className="mx-auto w-full rounded-t-full bg-gradient-to-t from-custom-color-500/25 via-custom-color-400/70 to-custom-color-300/90 shadow-[0_15px_35px_rgba(12,154,235,0.25)] transition group-hover:from-custom-color-400/50 group-hover:to-custom-color-200/90"
                      style={{ height: `${(value / maxChartValue) * 100}%` }}
                    />
                    <span className="mt-2 text-[10px] uppercase tracking-[0.26em] text-custom-color-700/70 dark:text-custom-color-100/60">
                      {index + 1}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {playbackHealth.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border border-white/15 bg-white/70 p-5 shadow-md dark:bg-custom-color-800/70`}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-custom-color-700/70 dark:text-custom-color-100/70">
                    {item.title}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <div
                      className={`h-2 w-3/4 rounded-full bg-gradient-to-r ${item.accent}`}
                    />
                    <span className="text-lg font-semibold text-custom-color-900 dark:text-white">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

