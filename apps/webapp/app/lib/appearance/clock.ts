export type ClockAppearance = {
  showClockSeconds?: boolean;
  showClockDate?: boolean;
  clockFormat?: "12h" | "24h";
  clockStyle?: "digital" | "analog";
  clockTimezone?: string;
  showMultipleClocks?: boolean;
  clockTimezone2?: string;
  clockTimezone3?: string;
  clockTimezone4?: string;
};

export const clockAppearanceDefaults: Required<
  Pick<
    ClockAppearance,
    | "showClockSeconds"
    | "showClockDate"
    | "clockFormat"
    | "clockTimezone"
  >
> = {
  showClockSeconds: true,
  showClockDate: false,
  clockFormat: "24h",
  clockTimezone: "Europe/Oslo",
};
