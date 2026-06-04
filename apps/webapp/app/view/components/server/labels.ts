export type ServerLocale = "nb" | "en";

export type ServerLabels = {
  statusColumn: string;
  serverColumn: string;
  pingColumn: string;
  portColumn: string;
  noServersConfigured: string;
  statusOnline: string;
  statusOffline: string;
  statusUnknown: string;
  playersLabel: string;
};

const SERVER_LABELS_NB: ServerLabels = {
  statusColumn: "Status",
  serverColumn: "Server",
  pingColumn: "Ping",
  portColumn: "Port",
  noServersConfigured: "Ingen servere konfigurert",
  statusOnline: "PÅ",
  statusOffline: "AV",
  statusUnknown: "?",
  playersLabel: "spillere",
};

const SERVER_LABELS_EN: ServerLabels = {
  statusColumn: "Status",
  serverColumn: "Server",
  pingColumn: "Ping",
  portColumn: "Port",
  noServersConfigured: "No servers configured",
  statusOnline: "ON",
  statusOffline: "OFF",
  statusUnknown: "?",
  playersLabel: "players",
};

export const SERVER_LABELS: Record<ServerLocale, ServerLabels> = {
  nb: SERVER_LABELS_NB,
  en: SERVER_LABELS_EN,
};

export function getServerStatusLabel(
  status: "online" | "offline" | "unknown",
  labels: ServerLabels
): string {
  if (status === "online") return labels.statusOnline;
  if (status === "offline") return labels.statusOffline;
  return labels.statusUnknown;
}
