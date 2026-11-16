"use client";

import type { MutableRefObject } from "react";

import type { CellAppearance } from "../../../lib/layout-types";
import { AnnouncementOptions } from "./AnnouncementOptions";
import { AppearanceSection } from "./AppearanceSection";
import { BrandOptions } from "./BrandOptions";
import { CalendarOptions } from "./CalendarOptions";
import { ChartsOptions } from "./ChartsOptions";
import { ClockOptions } from "./ClockOptions";
import { GarbageOptions } from "./GarbageOptions";
import { MediaOptions } from "./MediaOptions";
import { NewsOptions } from "./NewsOptions";
import { PowerOptions } from "./PowerOptions";
import { ServerOptions } from "./ServerOptions";
import { SolarOptions } from "./SolarOptions";
import { TasksOptions } from "./TasksOptions";
import { TransportOptions } from "./TransportOptions";
import type { ComponentOptionsContext, ComponentSelectionFlags } from "./types";
import { WeatherOptions } from "./WeatherOptions";

type ComponentOptionsPanelProps = {
  componentSelection: ComponentSelectionFlags;
  context: ComponentOptionsContext;
  previousBorderWidthRef: MutableRefObject<number>;
  previousBackgroundColorRef: MutableRefObject<string>;
};

export function ComponentOptionsPanel({
  componentSelection,
  context,
  previousBorderWidthRef,
  previousBackgroundColorRef,
}: ComponentOptionsPanelProps) {
  const {
    appearance,
    onAppearanceChange,
    googleConnected,
    isFullScreen,
    isClockQuarterOrMore,
    isTransportMediumOrLarge,
  } = context;

  return (
    <AppearanceSection
      appearance={appearance}
      onAppearanceChange={onAppearanceChange}
      previousBorderWidthRef={previousBorderWidthRef}
      previousBackgroundColorRef={previousBackgroundColorRef}
    >
      {componentSelection.clock ? (
        <ClockOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.weather ? (
        <WeatherOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.news ? (
        <NewsOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.announcement ? (
        <AnnouncementOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.brand ? (
        <BrandOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.calendar ? (
        <CalendarOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.transport ? (
        <TransportOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.media ? (
        <MediaOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.charts ? (
        <ChartsOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.server ? (
        <ServerOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.solar ? (
        <SolarOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.garbage ? (
        <GarbageOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.power ? (
        <PowerOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
      {componentSelection.tasks ? (
        <TasksOptions
          appearance={appearance}
          onAppearanceChange={onAppearanceChange}
          googleConnected={googleConnected}
          isFullScreen={isFullScreen}
          isClockQuarterOrMore={isClockQuarterOrMore}
          isTransportMediumOrLarge={isTransportMediumOrLarge}
        />
      ) : null}
    </AppearanceSection>
  );
}
