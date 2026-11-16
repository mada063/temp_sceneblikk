import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import { db } from "./firebase";
import type { GridConfig, GridCell, PersistedLayoutState } from "./layout-types";

// Helper to remove any `undefined` values from nested objects/arrays before
// persisting to Firestore (which disallows `undefined` anywhere in the data).
function removeUndefinedDeep<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedDeep(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
    if (val === undefined) {
      return;
    }
    result[key] = removeUndefinedDeep(val);
  });

  return result as T;
}

export type SavedLayout = {
  id: string;
  userId: string;
  name: string;
  config: GridConfig;
  cells: Record<string, GridCell>;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceStatus = {
  id: string;
  userId: string;
  deviceName: string;
  layoutId: string | null;
  layoutName: string | null;
  isFullscreen: boolean;
  lastHeartbeat: Date;
  status: "online" | "offline" | "standby";
};

// Layout operations
export async function saveLayout(
  userId: string,
  layoutId: string | null,
  name: string,
  config: GridConfig,
  cells: Record<string, GridCell>,
): Promise<string> {
  const layoutsRef = collection(db, "layouts");
  const layoutData = {
    userId,
    name,
    config: removeUndefinedDeep(config),
    cells: removeUndefinedDeep(cells),
    updatedAt: serverTimestamp(),
  };

  if (layoutId) {
    const layoutDoc = doc(layoutsRef, layoutId);
    await updateDoc(layoutDoc, layoutData);
    return layoutId;
  } else {
    const newLayoutRef = doc(layoutsRef);
    await setDoc(newLayoutRef, {
      ...layoutData,
      createdAt: serverTimestamp(),
    });
    return newLayoutRef.id;
  }
}

export async function getLayout(layoutId: string): Promise<SavedLayout | null> {
  const layoutDoc = doc(db, "layouts", layoutId);
  const snapshot = await getDoc(layoutDoc);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    name: data.name,
    config: data.config,
    cells: data.cells,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

export async function getUserLayouts(userId: string): Promise<SavedLayout[]> {
  const layoutsRef = collection(db, "layouts");
  const q = query(
    layoutsRef,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      userId: data.userId,
      name: data.name,
      config: data.config,
      cells: data.cells,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  });
}

export async function deleteLayout(layoutId: string): Promise<void> {
  const layoutDoc = doc(db, "layouts", layoutId);
  await deleteDoc(layoutDoc);
}

// Device status operations
export async function updateDeviceHeartbeat(
  userId: string,
  deviceId: string,
  deviceName: string,
  layoutId: string | null,
  layoutName: string | null,
  isFullscreen: boolean,
): Promise<void> {
  const devicesRef = collection(db, "devices");
  const deviceDoc = doc(devicesRef, deviceId);

  await setDoc(
    deviceDoc,
    {
      userId,
      deviceName,
      layoutId,
      layoutName,
      isFullscreen,
      lastHeartbeat: serverTimestamp(),
      status: isFullscreen ? "online" : "standby",
    },
    { merge: true },
  );
}

export async function getDeviceStatus(
  deviceId: string,
): Promise<DeviceStatus | null> {
  const deviceDoc = doc(db, "devices", deviceId);
  const snapshot = await getDoc(deviceDoc);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    deviceName: data.deviceName,
    layoutId: data.layoutId ?? null,
    layoutName: data.layoutName ?? null,
    isFullscreen: data.isFullscreen ?? false,
    lastHeartbeat: data.lastHeartbeat?.toDate() ?? new Date(),
    status: data.status ?? "offline",
  };
}

export async function getUserDevices(userId: string): Promise<DeviceStatus[]> {
  const devicesRef = collection(db, "devices");
  const q = query(devicesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      userId: data.userId,
      deviceName: data.deviceName,
      layoutId: data.layoutId ?? null,
      layoutName: data.layoutName ?? null,
      isFullscreen: data.isFullscreen ?? false,
      lastHeartbeat: data.lastHeartbeat?.toDate() ?? new Date(),
      status: data.status ?? "offline",
    };
  });
}

export function subscribeToUserDevices(
  userId: string,
  callback: (devices: DeviceStatus[]) => void,
): () => void {
  const devicesRef = collection(db, "devices");
  const q = query(devicesRef, where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const devices = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        userId: data.userId,
        deviceName: data.deviceName,
        layoutId: data.layoutId ?? null,
        layoutName: data.layoutName ?? null,
        isFullscreen: data.isFullscreen ?? false,
        lastHeartbeat: data.lastHeartbeat?.toDate() ?? new Date(),
        status: data.status ?? "offline",
      };
    });
    callback(devices);
  });
}

// Engagement tracking types
export type ViewSession = {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  layoutId: string | null;
  layoutName: string | null;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  isFullscreen: boolean;
};

export type LayoutViewEvent = {
  id: string;
  userId: string;
  deviceId: string;
  layoutId: string;
  layoutName: string;
  timestamp: Date;
  durationSeconds: number;
};

export type EngagementAnalytics = {
  totalViewTime: number; // in seconds
  totalSessions: number;
  averageSessionDuration: number; // in seconds
  peakHour: number; // 0-23
  layoutViews: Array<{
    layoutId: string;
    layoutName: string;
    viewCount: number;
    totalViewTime: number;
  }>;
  hourlyDistribution: number[]; // 24 hours
  deviceUptime: Array<{
    deviceId: string;
    deviceName: string;
    uptimePercentage: number;
    totalUptime: number;
  }>;
};

// Engagement tracking operations
export async function startViewSession(
  userId: string,
  deviceId: string,
  deviceName: string,
  layoutId: string | null,
  layoutName: string | null,
  isFullscreen: boolean,
): Promise<string> {
  const sessionsRef = collection(db, "viewSessions");
  const sessionDoc = doc(sessionsRef);
  
  await setDoc(sessionDoc, {
    userId,
    deviceId,
    deviceName,
    layoutId,
    layoutName,
    startTime: serverTimestamp(),
    endTime: null,
    durationSeconds: 0,
    isFullscreen,
  });
  
  return sessionDoc.id;
}

export async function endViewSession(sessionId: string): Promise<void> {
  const sessionDoc = doc(db, "viewSessions", sessionId);
  const snapshot = await getDoc(sessionDoc);
  
  if (!snapshot.exists()) {
    return;
  }
  
  const data = snapshot.data();
  const startTime = data.startTime?.toDate() ?? new Date();
  const endTime = new Date();
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  
  await updateDoc(sessionDoc, {
    endTime: serverTimestamp(),
    durationSeconds,
  });
  
  // Also record a layout view event if there's a layout
  if (data.layoutId && data.layoutName) {
    await recordLayoutView(
      data.userId,
      data.deviceId,
      data.layoutId,
      data.layoutName,
      durationSeconds,
    );
  }
}

export async function recordLayoutView(
  userId: string,
  deviceId: string,
  layoutId: string,
  layoutName: string,
  durationSeconds: number,
): Promise<void> {
  const viewsRef = collection(db, "layoutViews");
  await addDoc(viewsRef, {
    userId,
    deviceId,
    layoutId,
    layoutName,
    timestamp: serverTimestamp(),
    durationSeconds,
  });
}

export async function getEngagementAnalytics(
  userId: string,
  days: number = 7,
): Promise<EngagementAnalytics> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTimestamp = Timestamp.fromDate(cutoffDate);
  
  // Get view sessions
  const sessionsRef = collection(db, "viewSessions");
  const sessionsQuery = query(
    sessionsRef,
    where("userId", "==", userId),
    where("startTime", ">=", cutoffTimestamp),
    orderBy("startTime", "desc"),
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);
  
  // Get layout views
  const viewsRef = collection(db, "layoutViews");
  const viewsQuery = query(
    viewsRef,
    where("userId", "==", userId),
    where("timestamp", ">=", cutoffTimestamp),
    orderBy("timestamp", "desc"),
  );
  const viewsSnapshot = await getDocs(viewsQuery);
  
  // Process sessions
  const sessions = sessionsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      durationSeconds: data.durationSeconds ?? 0,
      startTime: data.startTime?.toDate() ?? new Date(),
      layoutId: data.layoutId ?? null,
      layoutName: data.layoutName ?? null,
      deviceId: data.deviceId,
    };
  });
  
  // Process layout views
  const layoutViews = viewsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      layoutId: data.layoutId,
      layoutName: data.layoutName,
      durationSeconds: data.durationSeconds ?? 0,
      timestamp: data.timestamp?.toDate() ?? new Date(),
    };
  });
  
  // Calculate metrics
  const totalViewTime = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalSessions = sessions.length;
  const averageSessionDuration = totalSessions > 0 ? totalViewTime / totalSessions : 0;
  
  // Hourly distribution
  const hourlyDistribution = new Array(24).fill(0);
  sessions.forEach((session) => {
    const hour = session.startTime.getHours();
    hourlyDistribution[hour] += session.durationSeconds;
  });
  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
  
  // Layout views aggregation
  const layoutMap = new Map<string, { name: string; count: number; totalTime: number }>();
  layoutViews.forEach((view) => {
    const existing = layoutMap.get(view.layoutId) || { name: view.layoutName, count: 0, totalTime: 0 };
    layoutMap.set(view.layoutId, {
      name: view.layoutName,
      count: existing.count + 1,
      totalTime: existing.totalTime + view.durationSeconds,
    });
  });
  
  const layoutViewsArray = Array.from(layoutMap.entries())
    .map(([layoutId, data]) => ({
      layoutId,
      layoutName: data.name,
      viewCount: data.count,
      totalViewTime: data.totalTime,
    }))
    .sort((a, b) => b.viewCount - a.viewCount);
  
  // Device uptime (based on sessions)
  // First, get device names from devices collection
  const devicesRef = collection(db, "devices");
  const devicesQuery = query(devicesRef, where("userId", "==", userId));
  const devicesSnapshot = await getDocs(devicesQuery);
  const deviceNames = new Map<string, string>();
  devicesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    deviceNames.set(doc.id, data.deviceName || `Device ${doc.id.substring(0, 8)}`);
  });
  
  const deviceMap = new Map<string, { totalTime: number; sessionCount: number }>();
  sessions.forEach((session) => {
    const existing = deviceMap.get(session.deviceId) || { totalTime: 0, sessionCount: 0 };
    deviceMap.set(session.deviceId, {
      totalTime: existing.totalTime + session.durationSeconds,
      sessionCount: existing.sessionCount + 1,
    });
  });
  
  // Calculate uptime percentage (assuming 24/7 operation, so uptime = total time / (days * 24 * 3600))
  const totalPossibleTime = days * 24 * 3600;
  const deviceUptime = Array.from(deviceMap.entries()).map(([deviceId, data]) => ({
    deviceId,
    deviceName: deviceNames.get(deviceId) || `Device ${deviceId.substring(0, 8)}`,
    uptimePercentage: totalPossibleTime > 0 ? (data.totalTime / totalPossibleTime) * 100 : 0,
    totalUptime: data.totalTime,
  }));
  
  return {
    totalViewTime,
    totalSessions,
    averageSessionDuration,
    peakHour,
    layoutViews: layoutViewsArray,
    hourlyDistribution,
    deviceUptime,
  };
}

