import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";
import { db } from "./firebase";
import type { GridConfig, GridCell, PersistedLayoutState } from "./layout-types";

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
    config,
    cells,
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

