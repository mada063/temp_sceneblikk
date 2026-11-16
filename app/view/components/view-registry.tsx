"use client";

import type { ComponentType } from "react";

import type { CellAppearance, Orientation } from "../../lib/layout-types";
import { Clock } from "./Clock";
import { Weather } from "./weather";
import { News } from "./news";
import { Announcements } from "./announcements";
import { Branding } from "./branding";
import { Transport } from "./transport";
import { Media } from "./media";
import { Charts } from "./charts";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { Server } from "./server";
import { Solar } from "./solar";
import { Garbage } from "./garbage";
import { Power } from "./power";

export type ViewComponentProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: Orientation;
};

type ViewComponentEntry = {
  component: ComponentType<ViewComponentProps>;
  supportsOrientation?: boolean;
};

export const VIEW_COMPONENT_REGISTRY: Record<string, ViewComponentEntry> = {
  clock: { component: Clock },
  weather: { component: Weather },
  news: { component: News },
  announcement: { component: Announcements },
  brand: { component: Branding },
  transport: { component: Transport },
  calendar: { component: Calendar, supportsOrientation: true },
  tasks: { component: Tasks, supportsOrientation: true },
  media: { component: Media },
  charts: { component: Charts, supportsOrientation: true },
  server: { component: Server },
  solar: { component: Solar },
  garbage: { component: Garbage },
  power: { component: Power },
};
