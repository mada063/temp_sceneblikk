export type TransportAppearance = {
  transportStopPlace?: string;
  transportStopPlace2?: string;
  transportShowDualStops?: boolean;
  transportTimeFormat?: "12h" | "24h";
  transportMaxDepartures?: number;
  transportBadgeColor?: string;
  transportBadgeBorder?: string;
  transportBadgeTextColor?: string;
  transportBadgeRadius?: number;
  transportDelayColor?: string;
};

export const transportAppearanceDefaults: Required<
  Pick<
    TransportAppearance,
    | "transportStopPlace"
    | "transportTimeFormat"
    | "transportMaxDepartures"
    | "transportBadgeTextColor"
    | "transportBadgeRadius"
    | "transportDelayColor"
  >
> & {
  transportBadgeColor: string;
  transportBadgeBorder: string;
} = {
  transportStopPlace: "62356",
  transportTimeFormat: "24h",
  transportMaxDepartures: 10,
  transportBadgeColor: "",
  transportBadgeBorder: "",
  transportBadgeTextColor: "#000000",
  transportBadgeRadius: 10,
  transportDelayColor: "#ef4444",
};
