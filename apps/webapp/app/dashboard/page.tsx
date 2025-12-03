/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiArrowLeft,
  FiClock,
  FiEye,
  FiGlobe,
  FiLayers,
  FiMonitor,
  FiPlusCircle,
} from "react-icons/fi";
import { useAuth } from "../lib/auth-context";
import {
  subscribeToUserDevices,
  getUserLayouts,
  getEngagementAnalytics,
  type DeviceStatus,
  type SavedLayout,
  type EngagementAnalytics,
} from "../lib/firestore";
import { useI18n } from "../lib/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

type RecentEdit = {
  id: string;
  title: string;
  editor: string;
  timestamp: string;
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

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
  const { t } = useI18n();
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [recentEdits, setRecentEdits] = useState<RecentEdit[]>([]);
  const [showChangelog, setShowChangelog] = useState(false);
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

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
          editor: user.displayName || user.email?.split("@")[0] || "User",
          timestamp: `Edited ${formatTimeAgo(layout.updatedAt)}`,
        })),
      );
    });

    // Load engagement analytics
    setAnalyticsLoading(true);
    getEngagementAnalytics(user.uid, timeRange)
      .then((data) => {
        setAnalytics(data);
        setAnalyticsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load analytics:", error);
        setAnalyticsLoading(false);
      });

    return () => unsubscribe();
  }, [user, timeRange]);

  // Calculate chart data from hourly distribution
  const chartData = useMemo(() => {
    if (!analytics) return new Array(12).fill(0);
    // Convert 24-hour data to 12-hour display (last 12 hours)
    const now = new Date();
    const currentHour = now.getHours();
    const data: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const hour = (currentHour - i + 24) % 24;
      data.push(analytics.hourlyDistribution[hour] || 0);
    }
    return data;
  }, [analytics]);

  const maxChartValue = useMemo(
    () => Math.max(...chartData, 1),
    [chartData],
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
  
  // Calculate playback health from device status
  const playbackHealth = useMemo(() => {
    const onlineCount = activeDevices.filter(d => d.effectiveStatus === "online").length;
    const standbyCount = activeDevices.filter(d => d.effectiveStatus === "standby").length;
    const offlineCount = devices.filter(d => {
      const timeSinceHeartbeat = Date.now() - d.lastHeartbeat.getTime();
      return timeSinceHeartbeat >= 120000 && !d.isFullscreen;
    }).length;
    const total = devices.length || 1;
    
    return [
      {
        title: t("dashboard", "livePlayback"),
        value: Math.round((onlineCount / total) * 100), 
        accent: "from-custom-color-400 to-custom-color-300" 
      },
      {
        title: t("dashboard", "standby"),
        value: Math.round((standbyCount / total) * 100), 
        accent: "from-amber-200/90 to-amber-400/60" 
      },
      {
        title: t("dashboard", "offline"),
        value: Math.round((offlineCount / total) * 100), 
        accent: "from-rose-200/90 to-rose-400/60" 
      },
    ];
  }, [devices, activeDevices]);

  return (
    <div className="min-h-screen bg-custom-color-100 text-black transition-colors duration-300 dark:bg-custom-color-900 dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/50 dark:border-custom-color-300/40 dark:text-custom-color-50 dark:hover:bg-custom-color-700/40"
              >
                <FiArrowLeft className="h-4 w-4" />
                {t("common", "back")}
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-custom-color-600 dark:text-custom-color-200">
                {t("common", "dashboard")}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("dashboard", "heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-custom-color-700/80 dark:text-custom-color-100/75">
              {t("dashboard", "subheading")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-full bg-custom-color-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
            >
              <FiPlusCircle className="h-4 w-4" />
              {t("dashboard", "createLayout")}
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
                Active views
              </h2>
              <button
                type="button"
                onClick={() => {
                  // Reports functionality - placeholder for now
                  alert(
                    "Reports feature coming soon! This will show detailed analytics and engagement metrics.",
                  );
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 transition hover:border-white/40 hover:bg-white/20 dark:text-custom-color-100"
              >
                <FiEye className="h-3.5 w-3.5" />
                {t("dashboard", "viewReports")}
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {activeDevices.length === 0 ? (
                <div className="rounded-2xl border border-white/15 bg-white/80 p-6 text-center dark:border-white/10 dark:bg-custom-color-800/70">
                  <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                    {t("dashboard", "noDevices")}
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
            <button
              type="button"
              onClick={() => setShowChangelog(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-sm font-semibold text-custom-color-600 transition hover:bg-custom-color-200/50 dark:border-custom-color-300/40 dark:text-custom-color-50 dark:hover:bg-custom-color-700/40"
            >
              <FiActivity className="h-4 w-4" />
              Review change log
            </button>
          </div>
        </section>

        <section className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
                Audience engagement
              </h2>
              <p className="text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
                View time and activity metrics (last {timeRange} days)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-full border border-white/20 bg-white/10 p-1 dark:border-white/10 dark:bg-custom-color-800/70">
                <button
                  type="button"
                  onClick={() => setTimeRange(7)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    timeRange === 7
                      ? "bg-custom-color-500 text-white dark:bg-custom-color-400"
                      : "text-custom-color-700 dark:text-custom-color-100/70"
                  }`}
                >
                  7d
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange(30)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    timeRange === 30
                      ? "bg-custom-color-500 text-white dark:bg-custom-color-400"
                      : "text-custom-color-700 dark:text-custom-color-100/70"
                  }`}
                >
                  30d
                </button>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-700 dark:bg-custom-color-800/70 dark:text-custom-color-100">
                <FiGlobe className="h-3.5 w-3.5" />
                Live sync
              </span>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="mt-8 flex items-center justify-center py-12">
              <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                Loading analytics...
              </p>
            </div>
          ) : analytics ? (
            <>
              <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
                <div className="flex flex-col justify-end gap-2 rounded-2xl border border-white/15 bg-white/70 p-6 dark:bg-custom-color-800/70">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-custom-color-700/70 dark:text-custom-color-100/70">
                        Hourly view time (last 12 hours)
                      </p>
                      <p className="mt-1 text-lg font-semibold text-custom-color-900 dark:text-white">
                        {formatDuration(chartData.reduce((a, b) => a + b, 0))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-custom-color-700/70 dark:text-custom-color-100/70">
                        Peak hour
                      </p>
                      <p className="mt-1 text-lg font-semibold text-custom-color-900 dark:text-white">
                        {analytics.peakHour}:00
                      </p>
                    </div>
                  </div>
                  <div className="flex h-48 items-end gap-3">
                    {chartData.map((value, index) => {
                      const now = new Date();
                      const hour = (now.getHours() - (11 - index) + 24) % 24;
                      return (
                        <div key={index} className="group flex w-full flex-col justify-end text-center">
                          <div
                            className="mx-auto w-full rounded-t-full bg-gradient-to-t from-custom-color-500/25 via-custom-color-400/70 to-custom-color-300/90 shadow-[0_15px_35px_rgba(12,154,235,0.25)] transition group-hover:from-custom-color-400/50 group-hover:to-custom-color-200/90"
                            style={{ height: `${(value / maxChartValue) * 100}%` }}
                            title={`${hour}:00 - ${formatDuration(value)}`}
                          />
                          <span className="mt-2 text-[10px] uppercase tracking-[0.26em] text-custom-color-700/70 dark:text-custom-color-100/60">
                            {hour}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-white/15 bg-white/70 p-5 shadow-md dark:bg-custom-color-800/70">
                    <p className="text-xs uppercase tracking-[0.22em] text-custom-color-700/70 dark:text-custom-color-100/70">
                      Total view time
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-custom-color-900 dark:text-white">
                      {formatDuration(analytics.totalViewTime)}
                    </p>
                    <p className="mt-1 text-xs text-custom-color-700/70 dark:text-custom-color-100/60">
                      {analytics.totalSessions} sessions · Avg {formatDuration(analytics.averageSessionDuration)}
                    </p>
                  </div>
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
              
              {/* Popular Layouts */}
              {analytics.layoutViews.length > 0 && (
                <div className="mt-8 rounded-2xl border border-white/15 bg-white/70 p-6 dark:bg-custom-color-800/70">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-custom-color-800 dark:text-custom-color-100 mb-4">
                    Most viewed layouts
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {analytics.layoutViews.slice(0, 6).map((layout) => (
                      <div
                        key={layout.layoutId}
                        className="rounded-xl border border-white/10 bg-white/50 p-4 dark:bg-custom-color-700/50"
                      >
                        <p className="text-sm font-semibold text-custom-color-900 dark:text-white truncate">
                          {layout.layoutName}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-custom-color-700/70 dark:text-custom-color-100/60">
                            {layout.viewCount} views
                          </span>
                          <span className="font-semibold text-custom-color-600 dark:text-custom-color-200">
                            {formatDuration(layout.totalViewTime)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Device Uptime */}
              {analytics.deviceUptime.length > 0 && (
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/70 p-6 dark:bg-custom-color-800/70">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-custom-color-800 dark:text-custom-color-100 mb-4">
                    Device uptime
                  </h3>
                  <div className="space-y-3">
                    {analytics.deviceUptime.map((device) => (
                      <div key={device.deviceId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-custom-color-900 dark:text-white">
                            {device.deviceName}
                          </p>
                          <p className="text-xs text-custom-color-700/70 dark:text-custom-color-100/60">
                            {formatDuration(device.totalUptime)} total
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-white/20 dark:bg-custom-color-700/50 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-custom-color-400 to-custom-color-300 transition-all"
                              style={{ width: `${Math.min(device.uptimePercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-custom-color-900 dark:text-white w-12 text-right">
                            {device.uptimePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/70 p-6 text-center dark:bg-custom-color-800/70">
              <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                No engagement data available yet. Start viewing layouts in fullscreen to track engagement.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowChangelog(false)}
        >
          <div
            className="glass-surface w-full max-w-2xl rounded-3xl border border-white/30 p-8 shadow-xl dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-custom-color-800 dark:text-custom-color-100">
                Change Log
              </h2>
              <button
                type="button"
                onClick={() => setShowChangelog(false)}
                className="rounded-full p-2 text-custom-color-600 transition hover:bg-custom-color-200/50 dark:text-custom-color-400 dark:hover:bg-custom-color-700/40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {recentEdits.length === 0 ? (
                <p className="text-sm text-custom-color-700/80 dark:text-custom-color-100/70">
                  No recent changes to display.
                </p>
              ) : (
                recentEdits.map((edit) => (
                  <div
                    key={edit.id}
                    className="rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm dark:bg-custom-color-800/70"
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
                      Edited by {edit.editor}
                    </p>
                    <Link
                      href={`/editor?layoutId=${edit.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-500 transition hover:text-custom-color-400 dark:text-custom-color-200 dark:hover:text-custom-color-100"
                    >
                      Open layout →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

