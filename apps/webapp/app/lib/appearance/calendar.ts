export type CalendarAppearance = {
  calendarShowUpcoming?: boolean;
  calendarProvider?: "demo" | "google";
  calendarId?: string;
  calendarAccentColor?: string;
  calendarMutedColor?: string;
  calendarCellBackground?: string;
  calendarTodayHighlight?: string;
  calendarEventPalette?: string;
  calendarDisableAnimations?: boolean;
};

export const calendarAppearanceDefaults: Required<
  Pick<
    CalendarAppearance,
    | "calendarShowUpcoming"
    | "calendarProvider"
    | "calendarId"
    | "calendarAccentColor"
    | "calendarMutedColor"
    | "calendarCellBackground"
    | "calendarTodayHighlight"
    | "calendarEventPalette"
    | "calendarDisableAnimations"
  >
> = {
  calendarShowUpcoming: true,
  calendarProvider: "demo",
  calendarId: "primary",
  calendarAccentColor: "",
  calendarMutedColor: "",
  calendarCellBackground: "",
  calendarTodayHighlight: "",
  calendarEventPalette: "",
  calendarDisableAnimations: false,
};
