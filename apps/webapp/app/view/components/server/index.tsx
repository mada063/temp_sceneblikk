"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ServerSmall } from "./ServerSmall";
import { ServerMedium } from "./ServerMedium";
import { ServerLarge } from "./ServerLarge";
import { ServerXLarge } from "./ServerXLarge";
import { fetchSingleServerInfo, extractServerName, normalizeUrl, extractPort, parseMinecraftAddress } from "./utils";
import type { ServerProps, PanelSize, ServerData, ServerInfo } from "./types";

export function Server({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: ServerProps) {
  const {
    serverType = "website",
    serverUrls = [],
  } = appearance;

  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Filter out empty URLs
  const urls = useMemo(() => {
    if (Array.isArray(serverUrls)) {
      return serverUrls.filter((url) => url && url.trim().length > 0);
    }
    return [];
  }, [serverUrls]);

  // Calculate panel size for responsive display
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

    // Cancel any ongoing requests
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();

    // Initialize with placeholder servers (showing loading state)
    const initialServers: ServerInfo[] = urls.map((url) => {
      if (serverType === "minecraft") {
        const { hostname, port } = parseMinecraftAddress(url);
        return {
          name: hostname,
          status: "unknown" as const,
          ping: null,
          port,
          motd: null,
          playersOnline: null,
          playersMax: null,
        };
      } else {
        const normalized = normalizeUrl(url);
        const name = extractServerName(normalized);
        const port = extractPort(normalized);
        return {
          name,
          status: "unknown" as const,
          ping: null,
          port,
        };
      }
    });

    setServerData({
      servers: initialServers,
      lastUpdated: new Date(),
    });
    setLoading(false);
    setError(null);

    // Function to update a single server's data
    const updateServer = (index: number, serverInfo: ServerInfo) => {
      if (!isMounted) return;
      
      setServerData((prev) => {
        if (!prev) return prev;
        const newServers = [...prev.servers];
        newServers[index] = serverInfo;
        return {
          servers: newServers,
          lastUpdated: new Date(),
        };
      });
    };

    // Check each server independently and update as results come in
    urls.forEach((url, index) => {
      const controller = new AbortController();
      abortControllersRef.current.set(url, controller);

      fetchSingleServerInfo(url, serverType)
        .then((serverInfo) => {
          if (!controller.signal.aborted && isMounted) {
            updateServer(index, serverInfo);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted && isMounted) {
            console.error(`Error checking server ${url}:`, err);
            // Update with error state
            if (serverType === "minecraft") {
              const { hostname, port } = parseMinecraftAddress(url);
              updateServer(index, {
                name: hostname,
                status: "offline",
                ping: null,
                port,
                motd: null,
                playersOnline: null,
                playersMax: null,
              });
            } else {
              const normalized = normalizeUrl(url);
              const name = extractServerName(normalized);
              const port = extractPort(normalized);
              updateServer(index, {
                name,
                status: "offline",
                ping: null,
                port,
              });
            }
          }
        })
        .finally(() => {
          abortControllersRef.current.delete(url);
        });
    });

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isMounted) return;

      urls.forEach((url, index) => {
        const controller = new AbortController();
        abortControllersRef.current.set(url, controller);

        fetchSingleServerInfo(url, serverType)
          .then((serverInfo) => {
            if (!controller.signal.aborted && isMounted) {
              updateServer(index, serverInfo);
            }
          })
          .catch((err) => {
            if (!controller.signal.aborted && isMounted) {
              console.error(`Error checking server ${url}:`, err);
              if (serverType === "minecraft") {
                const { hostname, port } = parseMinecraftAddress(url);
                updateServer(index, {
                  name: hostname,
                  status: "offline",
                  ping: null,
                  port,
                  motd: null,
                  playersOnline: null,
                  playersMax: null,
                });
              } else {
                const normalized = normalizeUrl(url);
                const name = extractServerName(normalized);
                const port = extractPort(normalized);
                updateServer(index, {
                  name,
                  status: "offline",
                  ping: null,
                  port,
                });
              }
            }
          })
          .finally(() => {
            abortControllersRef.current.delete(url);
          });
      });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      // Cancel all ongoing requests
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    };
  }, [urls, serverType]);

  const commonProps = {
    appearance,
    serverData,
    loading,
    error,
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

