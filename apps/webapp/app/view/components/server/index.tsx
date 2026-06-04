"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { ServerSmall } from "./ServerSmall";
import { ServerMedium } from "./ServerMedium";
import { ServerLarge } from "./ServerLarge";
import { ServerXLarge } from "./ServerXLarge";
import { fetchSingleServerInfo, buildPlaceholderServerInfo, buildOfflineServerInfo } from "./utils";
import {
  getCachedServerInfo,
  setCachedServerInfo,
  isServerCacheFresh,
  SERVER_CACHE_TTL_MS,
} from "./server-cache";
import { useI18n } from "../../../lib/i18n";
import { SERVER_LABELS, type ServerLocale } from "./labels";
import type { ServerProps, PanelSize, ServerData, ServerInfo } from "./types";

export function Server({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: ServerProps) {
  const { locale: appLocale } = useI18n();
  const locale: ServerLocale = appearance.serverLanguage ?? appLocale;
  const labels = SERVER_LABELS[locale];
  const {
    serverType = "website",
    serverUrls = [],
  } = appearance;

  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const urls = useMemo(() => {
    if (Array.isArray(serverUrls)) {
      return serverUrls.filter((url) => url && url.trim().length > 0);
    }
    return [];
  }, [serverUrls]);

  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;

    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }

    const fraction = panelArea / totalGridSize;

    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  const updateServer = useCallback((index: number, serverInfo: ServerInfo) => {
    setServerData((prev) => {
      if (!prev) return prev;
      const newServers = [...prev.servers];
      newServers[index] = serverInfo;
      return {
        servers: newServers,
        lastUpdated: new Date(),
      };
    });
  }, []);

  useEffect(() => {
    if (urls.length === 0) {
      setServerData({
        servers: [],
        lastUpdated: new Date(),
      });
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();

    const initialServers: ServerInfo[] = urls.map((url) => {
      const cached = getCachedServerInfo(url, serverType);
      if (isServerCacheFresh(cached)) {
        return cached!.data;
      }
      return buildPlaceholderServerInfo(url, serverType);
    });

    setServerData({
      servers: initialServers,
      lastUpdated: new Date(),
    });
    setLoading(false);
    setError(null);

    const checkServer = (url: string, index: number, force = false) => {
      const cached = getCachedServerInfo(url, serverType);
      if (!force && isServerCacheFresh(cached)) {
        if (isMounted) {
          updateServer(index, cached!.data);
        }
        return;
      }

      const controller = new AbortController();
      abortControllersRef.current.set(url, controller);

      fetchSingleServerInfo(url, serverType)
        .then((serverInfo) => {
          if (!controller.signal.aborted && isMounted) {
            setCachedServerInfo(url, serverType, serverInfo);
            updateServer(index, serverInfo);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted && isMounted) {
            console.error(`Error checking server ${url}:`, err);
            const offline = buildOfflineServerInfo(url, serverType);
            setCachedServerInfo(url, serverType, offline);
            updateServer(index, offline);
          }
        })
        .finally(() => {
          abortControllersRef.current.delete(url);
        });
    };

    urls.forEach((url, index) => checkServer(url, index));

    const interval = setInterval(() => {
      if (!isMounted) return;
      urls.forEach((url, index) => checkServer(url, index, true));
    }, SERVER_CACHE_TTL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    };
  }, [urls, serverType, updateServer]);

  const commonProps = {
    appearance,
    serverData,
    loading,
    error,
    labels,
    colSpan,
    rowSpan,
  };

  switch (panelSize) {
    case "tiny":
    case "small":
      return <ServerSmall {...commonProps} />;
    case "medium":
      return <ServerMedium {...commonProps} />;
    case "large":
      return <ServerLarge {...commonProps} />;
    case "xlarge":
      return <ServerXLarge {...commonProps} />;
    default:
      return <ServerSmall {...commonProps} />;
  }
}
