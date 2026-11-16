import {
  baseAppearanceDefaults,
  type BaseAppearance,
} from "./base";
import {
  clockAppearanceDefaults,
  type ClockAppearance,
} from "./clock";
import {
  weatherAppearanceDefaults,
  type WeatherAppearance,
} from "./weather";
import { newsAppearanceDefaults, type NewsAppearance } from "./news";
import {
  announcementAppearanceDefaults,
  type AnnouncementAppearance,
} from "./announcement";
import { brandAppearanceDefaults, type BrandAppearance } from "./brand";
import {
  calendarAppearanceDefaults,
  type CalendarAppearance,
} from "./calendar";
import { tasksAppearanceDefaults, type TasksAppearance } from "./tasks";
import {
  transportAppearanceDefaults,
  type TransportAppearance,
} from "./transport";
import { mediaAppearanceDefaults, type MediaAppearance } from "./media";
import { chartsAppearanceDefaults, type ChartsAppearance } from "./charts";
import { serverAppearanceDefaults, type ServerAppearance } from "./server";
import { solarAppearanceDefaults, type SolarAppearance } from "./solar";
import {
  garbageAppearanceDefaults,
  type GarbageAppearance,
} from "./garbage";
import { powerAppearanceDefaults, type PowerAppearance } from "./power";

export type {
  BaseAppearance,
  ClockAppearance,
  WeatherAppearance,
  NewsAppearance,
  AnnouncementAppearance,
  BrandAppearance,
  CalendarAppearance,
  TasksAppearance,
  TransportAppearance,
  MediaAppearance,
  ChartsAppearance,
  ServerAppearance,
  SolarAppearance,
  GarbageAppearance,
  PowerAppearance,
};

/** Flat persisted appearance object used by grid cells and panel entries. */
export type CellAppearance = BaseAppearance &
  ClockAppearance &
  WeatherAppearance &
  NewsAppearance &
  AnnouncementAppearance &
  BrandAppearance &
  CalendarAppearance &
  TasksAppearance &
  TransportAppearance &
  MediaAppearance &
  ChartsAppearance &
  ServerAppearance &
  SolarAppearance &
  GarbageAppearance &
  PowerAppearance;

export const makeDefaultAppearance = (): CellAppearance => ({
  ...baseAppearanceDefaults,
  ...clockAppearanceDefaults,
  ...weatherAppearanceDefaults,
  ...newsAppearanceDefaults,
  ...announcementAppearanceDefaults,
  ...brandAppearanceDefaults,
  ...calendarAppearanceDefaults,
  ...tasksAppearanceDefaults,
  ...transportAppearanceDefaults,
  ...mediaAppearanceDefaults,
  ...chartsAppearanceDefaults,
  ...serverAppearanceDefaults,
  ...solarAppearanceDefaults,
  ...garbageAppearanceDefaults,
  ...powerAppearanceDefaults,
  powerLanguage: undefined,
  serverLanguage: undefined,
});

export const cloneAppearance = (appearance?: CellAppearance | null) =>
  appearance ? { ...makeDefaultAppearance(), ...appearance } : undefined;
