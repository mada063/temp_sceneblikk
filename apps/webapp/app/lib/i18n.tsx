'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Locale = "nb" | "en";

const SUPPORTED_LOCALES: Locale[] = ["nb", "en"];
const DEFAULT_LOCALE: Locale = "nb";

const messages = {
  nb: {
    common: {
      back: "Tilbake",
      dashboard: "Dashbord",
      language: "Språk",
    },
    home: {
      title: "Lag skiltingsoppsett som skalerer til alle skjermer.",
      subtitle:
        "Design nøyaktige lerret, sett sammen innhold med gjenbrukbare komponenter og overvåk aktive skjermer fra ett kontrollsenter.",
      startEditing: "Start redigering",
      openDashboard: "Åpne dashbord",
      launchPlayer: "Start avspiller",
      explore: "Utforsk →",
      quickStartEditorDescription:
        "Design responsive skiltingsoppsett med nøyaktige rutenett.",
      quickStartDashboardDescription:
        "Overvåk skjermer, se oppdateringer og følg med på engasjement.",
      quickStartPlayerDescription:
        "Forhåndsvis skiltingen i fullskjerm før du publiserer.",
    },
    dashboard: {
      heading: "Oversikt over avspilling",
      subheading:
        "Overvåk alle skjermer, oppdag utdatert innhold og hold skilting i gang uten avbrudd.",
      createLayout: "Opprett nytt oppsett",
      viewReports: "Se rapporter",
      noDevices:
        "Ingen aktive enheter. Åpne avspillervisningen i fullskjerm for å se status her.",
      livePlayback: "Direkteavspilling",
      standby: "Ventemodus",
      offline: "Frakoblet",
      logout: "Logg ut",
    },
    login: {
      subtitleSignUp: "Opprett en konto for å komme i gang",
      subtitleSignIn: "Logg inn for å få tilgang til oppsettene dine",
      emailLabel: "E-post",
      emailPlaceholder: "deg@example.com",
      nameLabel: "Navn (valgfritt)",
      namePlaceholder: "Ditt navn",
      passwordLabel: "Passord",
      primaryLoading: "Vennligst vent …",
      primarySignUp: "Opprett konto",
      primarySignIn: "Logg inn",
      orContinueWith: "Eller fortsett med",
      signInWithGoogle: "Logg inn med Google",
      continueAsGuest: "Fortsett som gjest",
      toggleToSignIn: "Har du allerede en konto? Logg inn",
      toggleToSignUp: "Har du ikke en konto? Registrer deg",
      authFailed: "Innlogging feilet. Prøv igjen.",
      googleFailed: "Google-innlogging feilet. Prøv igjen.",
      guestFailed: "Gjest-innlogging feilet. Prøv igjen.",
    },
    auth: {
      checkingSession: "Sjekker økten din …",
      redirectingToLogin: "Sender deg til innlogging …",
    },
    editor: {
      // Canvas & library
      gridSettings: "Rutenett",
      screenSizeInchesLabel: "Skjermstørrelse (tommer)",
      gridColumnsLabel: "Kolonner",
      gridRowsLabel: "Rader",
      gridGapLabel: "Mellomrom (px)",
      backgroundColorLabel: "Bakgrunnsfarge",
      gridSummaryLabel: "Oppsummering",
      componentLibraryLabel: "Komponentbibliotek",
      detachComponentLibrary: "Løsne komponentbibliotek",
      searchComponentsPlaceholder: "Søk i komponenter …",
      noComponentsFoundTitle: "Ingen komponenter funnet",
      noComponentsFoundBody: "Prøv et annet søkebegrep",
      // Panel playback
      panelPlaybackTitle: "Panel-avspilling",
      panelPlaybackCyclePrefix: "Syklus",
      panelPlaybackDescription:
        "Juster varigheten for hver komponent. Panelet looper kontinuerlig gjennom denne rekkefølgen.",
      panelPlaybackClickHint:
        "Klikk på et element for å redigere innstillingene for det.",
      panelPlaybackDurationLabel: "Varighet (s)",
      panelPlaybackRemove: "Fjern",
      panelPlaybackEditingSuffix: "(redigerer innstillinger)",
      // Layout selector
      savedLayoutsTitle: "Lagrede oppsett",
      saveButtonLabel: "Lagre",
      saveDialogPlaceholder: "Navn på oppsett",
      saveDialogSaving: "Lagrer …",
      saveDialogSave: "Lagre",
      saveDialogCancel: "Avbryt",
      loadingLayouts: "Laster oppsett …",
      noLayouts: "Ingen lagrede oppsett. Lag et for å komme i gang.",
      deleteLayoutConfirm: "Er du sikker på at du vil slette dette oppsettet?",
      // Announcement editor
      announcementPlaceholder: "Skriv inn tekst til kunngjøringen …",
      richTextBoldTitle: "Fet",
      richTextItalicTitle: "Kursiv",
      richTextListTitle: "Punktliste",
      richTextApplyTagLabel: "Bruk tag:",
      // Selected component panel – header & empty state
      selectedComponentTitle: "Valgt komponent",
      selectedComponentDefaultLabel: "Tilpasset komponent",
      selectedComponentMultipleSuffix: "valgt",
      selectedComponentDifferentTypes: "komponenter valgt (forskjellige typer)",
      selectedComponentEmptyHint:
        "Velg en komponent i rutenettet for å finjustere størrelse, utseende eller fjerne den fra oppsettet.",
      removeSingle: "Fjern komponent",
      removeMultiple: "Fjern valgte",
      // Freeform / panel labels (also used in player)
      pageBreadcrumb: "Editor",
      pageTitle: "Layoutverktøy",
      pageSubtitle:
        "Konfigurer lerretet, sett sammen komponenter og finjuster modulstørrelser før du starter fullskjermspilleren.",
      resetLayout: "Tilbakestill oppsett",
      rotateToPortrait: "Roter til stående",
      rotateToLandscape: "Roter til liggende",
      viewFullscreen: "Vis i fullskjerm",
      ctaMonitorTitle: "Trenger du å overvåke innhold?",
      ctaMonitorBody:
        "Gå til dashbordet for å følge med på avspilling, oppdage utdaterte oppsett og samarbeide med skiltingsteamet ditt.",
      ctaOpenDashboard: "Åpne dashbord",
      panelLabel: "Panel",
      panelItemSingular: "element",
      panelItemPlural: "elementer",
      panelEmptyLabel: "Tom",
      panelMoreSuffix: "til",
      // Canvas preview
      canvasPreviewTitle: "Forhåndsvisning av lerret",
      canvasSurfaceSuffix: "overflate",
      canvasWidthSuffix: "bredde",
      canvasGridSuffix: "rutenett",
      orientationLandscapeLabel: "Liggende",
      orientationPortraitLabel: "Stående",
      // Selected component panel – geometry & appearance
      dimensionWidthColumnsLabel: "Bredde (kolonner)",
      dimensionHeightRowsLabel: "Høyde (rader)",
      appearanceSectionTitle: "Utseende",
      appearanceBackgroundColorLabel: "Bakgrunnsfarge",
      appearanceTransparentBackgroundLabel: "Gjennomsiktig bakgrunn",
      appearanceShowBorderLabel: "Vis ramme",
      appearanceBorderColorLabel: "Rammefarge",
      appearanceTextColorLabel: "Tekstfarge",
      appearanceRoundedCornersLabel: "Avrundede hjørner",
      appearanceBorderThicknessLabel: "Rammens tykkelse",
      timeFormatLabel: "Tidsformat",
      noneOptionLabel: "Ingen",
      // Freeform guidance
      freeformHint:
        "Dra i tomme ruter for å tegne opp panelet på nytt, slipp bibliotekskomponenter oppå for å bygge spillelisten, eller juster størrelsen under.",
      // Clock options
      clockOptionsTitle: "Klokkeinnstillinger",
      clockShowSecondsLabel: "Vis sekunder",
      clockShowDateLabel: "Vis dato",
      clockTimezoneLabel: "Tidssone",
      clockStyleLabel: "Klokkestil",
      clockStyleDigitalLabel: "Digital",
      clockStyleAnalogLabel: "Analog",
      clockShowMultipleClocksLabel: "Vis flere klokker",
      clockSecondTimezoneLabel: "Andre tidssone",
      clockThirdTimezoneLabel: "Tredje tidssone",
      clockFourthTimezoneLabel: "Fjerde tidssone",
      // Weather options
      weatherOptionsTitle: "Værinnstillinger",
      weatherLocationLabel: "Sted",
      weatherShowAirQualityLabel: "Vis luftkvalitet",
      weatherShowLocationForecastLabel: "Vis stedsvarsel",
      weatherShowTwoChartsLabel: "Vis 2 grafer",
      weatherSecondLocationLabel: "Andre sted",
      weatherMinLabel: "Min",
      weatherAvgLabel: "Snitt",
      weatherMaxLabel: "Maks",
      // News options
      newsOptionsTitle: "Nyhetsinnstillinger",
      newsFeedLabel: "Nyhetskilde",
      newsShowSourceLabel: "Vis kilde",
      newsMaxItemsLabel: "Maks antall saker",
      newsScrollSpeedLabel: "Rullehastighet",
      // Announcement options
      announcementOptionsTitle: "Kunngjøringsinnstillinger",
      announcementTextLabel: "Kunngjøringstekst",
      // Branding options
      brandOptionsTitle: "Profilinnstillinger",
      brandLogoUrlLabel: "Logo‑adresse (URL)",
      brandTextLabel: "Profiltekst",
      brandTextPlaceholder: "Firmanavn eller slagord",
      // Calendar options
      calendarOptionsTitle: "Kalenderinnstillinger",
      calendarProviderLabel: "Kalenderleverandør",
      calendarProviderDemoLabel: "Demo (eksempedata)",
      calendarProviderGoogleLabel: "Google Kalender",
      calendarProviderOutlookSoonLabel: "Outlook (kommer snart)",
      calendarConnectGoogleButton: "Koble til Google‑konto",
      calendarConnectGoogleHelp:
        "Koble til en Google‑konto én gang, og velg deretter Google Kalender for å hente ekte hendelser. Flere leverandører kommer senere.",
      calendarIdLabel: "Google‑kalender‑ID",
      calendarIdHelp:
        "Bruk \"primary\" for hovedkalenderen, eller skriv inn en spesifikk kalender‑ID.",
      calendarShowUpcomingLabel: "Vis kommende liste",
      calendarAccentColorLabel: "Markeringsfarge",
      calendarMutedTextColorLabel: "Dempet tekstfarge",
      calendarCellBackgroundLabel: "Bakgrunn for ruter",
      calendarTodayHighlightLabel: "Markering for i dag",
      calendarEventColorsLabel: "Hendelsesfarger (kommaseparert)",
      calendarEventColorsPlaceholder: "#d8b4fe, #bfdbfe, #fecdd3",
      calendarEventColorsHelp:
        "La stå tom for å bruke standard pastell‑palett.",
      calendarHeaderLabel: "Kalender",
      calendarWeekPrefix: "Uke",
      calendarTodayLabel: "I dag",
      calendarUpcomingHeader: "Kommende hendelser",
      calendarNoUpcomingMessage: "Ingen planlagte aktiviteter denne måneden.",
      calendarNoActivitiesToday: "Ingen planlagte aktiviteter i dag.",
      calendarNoActivitiesMessage: "Ingen planlagte aktiviteter.",
      calendarMoreEvents: "more...",
      calendarDisableAnimationsLabel: "Deaktiver animasjoner",
      calendarWeekdayMon: "Man",
      calendarWeekdayTue: "Tir",
      calendarWeekdayWed: "Ons",
      calendarWeekdayThu: "Tor",
      calendarWeekdayFri: "Fre",
      calendarWeekdaySat: "Lør",
      calendarWeekdaySun: "Søn",
      googleOAuthConnected: "Google‑konto tilkoblet",
      googleOAuthNotConnected: "Google‑konto ikke tilkoblet ennå",
      // Transport options
      transportOptionsTitle: "Reiseinformasjon",
      transportStopPlaceLabel: "Stoppested",
      transportTimeFormatLabel: "Tidsformat",
      transportMaxDeparturesLabel: "Maks avganger",
      transportShowDualStopsLabel: "Vis dobbelt stoppested",
      transportSecondStopPlaceLabel: "Andre stoppested",
      transportBadgeColorLabel: "Farge på merke",
      transportBadgeBorderColorLabel: "Rammefarge på merke",
      transportBadgeTextColorLabel: "Tekstfarge på merke",
      transportDelayTextColorLabel: "Forsinkelsesfarge",
      transportBadgeRoundednessLabel: "Runding på merke",
      transportNoDeparturesMessage: "Ingen avganger",
      transportNoDeparturesNowMessage: "Ingen avganger for øyeblikket",
      transportLoadingSecondStopMessage: "Laster andre stopp …",
      transportPlatformLabel: "Plattform",
      transportMinutesSuffix: "min",
      transportDelayMinutesPrefix: "+",
      // Media options
      mediaOptionsTitle: "Mediainnstillinger",
      mediaTypeLabel: "Mediatype",
      mediaTypeImageLabel: "Bilde",
      mediaTypeVideoLabel: "Video",
      mediaUrlsLabel: "Media‑adresser (URL‑er)",
      mediaUrlsPlaceholder:
        "https://example.com/bilde1.jpg https://example.com/bilde2.jpg",
      mediaUrlsHelp:
        "Skriv inn adresser separert med komma eller mellomrom. Én per linje fungerer også.",
      mediaAutoPlayLabel: "Automatisk karusell",
      mediaTransitionDurationLabel: "Overgangsvarighet",
      mediaEmptyMessage: "Ingen media",
      mediaFallbackAlt: "Media",
      // Charts options
      chartsOptionsTitle: "Diagraminnstillinger",
      chartsEmptyMessage: "Ingen diagramdata",
      chartsUnsupportedPrefix: "Ikke støttet:",
      chartsXAxisLabelPrefix: "X:",
      chartsYAxisLabelPrefix: "Y:",
      // Tasks options & player text
      tasksOptionsTitle: "Oppgaveinnstillinger",
      tasksProviderLabel: "Oppgavekilde",
      tasksProviderDemoLabel: "Demo (eksempedata)",
      tasksProviderGoogleLabel: "Google Tasks",
      tasksProviderOutlookSoonLabel: "Outlook Tasks (kommer snart)",
      tasksConnectGoogleButton: "Koble til Google‑konto",
      tasksConnectGoogleHelp:
        "Koble til en Google‑konto én gang, og velg deretter Google Tasks for å hente ekte oppgaver. Flere leverandører kommer senere.",
      tasksListIdLabel: "Google‑liste‑ID",
      tasksListIdPlaceholder: "La stå tom for å bruke din første oppgaveliste",
      tasksListIdHelp:
        "Bruk en spesifikk liste‑ID hvis du vil målrette en bestemt liste.",
      tasksHeaderLabel: "OPPGAVER",
      tasksEmptyMessage: "Ingen oppgaver å vise.",
      tasksDuePastPrefix: "For",
      tasksDuePastSuffix: "d. siden",
      tasksDueTodayLabel: "I dag",
      tasksDueTomorrowLabel: "I morgen",
      tasksDueInPrefix: "Om",
      tasksDueInSuffix: "d.",
      // Solar (view + editor)
      solarOptionsTitle: "Sol",
      solarLocationLabel: "Posisjon (sted)",
      solarShowDayLength: "Vis dagslengde",
      solarShowSolarNoon: "Vis solmidde",
      solarDawn: "Daggry",
      solarSunrise: "Soloppgang",
      solarNoon: "Solmidde",
      solarSunset: "Solnedgang",
      solarDusk: "Skumring",
      solarDayLength: "Dagslengde",
      solarNextDawn: "Daggry",
      solarNextSunrise: "Soloppgang",
      solarNextSunset: "Solnedgang",
      solarNextDusk: "Skumring",
      solarNight: "Natt",
      solarSearchPlaceholder: "Søk sted (f.eks. Bergen, Oslo)",
      // Power (view)
      powerSourceLabel: "Hva koster strømmen.no",
      powerPricesToday: "Dagens priser",
      powerPriceNow: "Nå",
    },
  },
  en: {
    common: {
      back: "Back",
      dashboard: "Dashboard",
      language: "Language",
    },
    home: {
      title: "Create signage layouts that scale with every screen.",
      subtitle:
        "Design inch-perfect canvases, assemble content with reusable components, and monitor active screens from a single control centre.",
      startEditing: "Start editing",
      openDashboard: "Open dashboard",
      launchPlayer: "Launch player",
      explore: "Explore →",
      quickStartEditorDescription:
        "Design responsive signage layouts with inch-perfect grids.",
      quickStartDashboardDescription:
        "Monitor screens, view updates, and track engagement.",
      quickStartPlayerDescription:
        "Preview the full-screen signage player experience.",
    },
    dashboard: {
      heading: "Playback operations overview",
      subheading:
        "Monitor every live screen, spot stale content, and keep signage running flawlessly.",
      createLayout: "Create new layout",
      viewReports: "View reports",
      noDevices:
        "No active devices. Open the player view in fullscreen to see device status here.",
      livePlayback: "Live playback",
      standby: "Standby",
      offline: "Offline",
      logout: "Log out",
    },
    login: {
      subtitleSignUp: "Create an account to get started",
      subtitleSignIn: "Sign in to access your layouts",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      nameLabel: "Name (optional)",
      namePlaceholder: "Your name",
      passwordLabel: "Password",
      primaryLoading: "Please wait…",
      primarySignUp: "Create account",
      primarySignIn: "Sign in",
      orContinueWith: "Or continue with",
      signInWithGoogle: "Sign in with Google",
      continueAsGuest: "Continue as guest",
      toggleToSignIn: "Already have an account? Sign in",
      toggleToSignUp: "Don't have an account? Sign up",
      authFailed: "Authentication failed. Please try again.",
      googleFailed: "Google sign-in failed. Please try again.",
      guestFailed: "Guest sign-in failed. Please try again.",
    },
    auth: {
      checkingSession: "Checking your session…",
      redirectingToLogin: "Redirecting to login…",
    },
    editor: {
      // Canvas & library
      gridSettings: "Grid settings",
      screenSizeInchesLabel: "Screen size (inches)",
      gridColumnsLabel: "Grid columns",
      gridRowsLabel: "Grid rows",
      gridGapLabel: "Grid gap (px)",
      backgroundColorLabel: "Background color",
      gridSummaryLabel: "Grid summary",
      componentLibraryLabel: "Component library",
      detachComponentLibrary: "Detach component library",
      searchComponentsPlaceholder: "Search components…",
      noComponentsFoundTitle: "No components found",
      noComponentsFoundBody: "Try a different search term",
      // Panel playback
      panelPlaybackTitle: "Panel playback",
      panelPlaybackCyclePrefix: "Cycle",
      panelPlaybackDescription:
        "Adjust each component’s duration. The panel loops through this order continuously.",
      panelPlaybackClickHint:
        "Click an entry to edit its individual settings.",
      panelPlaybackDurationLabel: "Duration (s)",
      panelPlaybackRemove: "Remove",
      panelPlaybackEditingSuffix: "(editing settings)",
      // Layout selector
      savedLayoutsTitle: "Saved layouts",
      saveButtonLabel: "Save",
      saveDialogPlaceholder: "Layout name",
      saveDialogSaving: "Saving…",
      saveDialogSave: "Save",
      saveDialogCancel: "Cancel",
      loadingLayouts: "Loading layouts…",
      noLayouts: "No saved layouts. Create one to get started.",
      deleteLayoutConfirm: "Are you sure you want to delete this layout?",
      // Announcement editor
      announcementPlaceholder: "Enter announcement text…",
      richTextBoldTitle: "Bold",
      richTextItalicTitle: "Italic",
      richTextListTitle: "Bullet list",
      richTextApplyTagLabel: "Apply tag:",
      // Selected component panel – header & empty state
      selectedComponentTitle: "Selected component",
      selectedComponentDefaultLabel: "Custom component",
      selectedComponentMultipleSuffix: "selected",
      selectedComponentDifferentTypes: "components selected (different types)",
      selectedComponentEmptyHint:
        "Select any component on the canvas to fine‑tune its footprint, appearance, or remove it from the layout.",
      removeSingle: "Remove component",
      removeMultiple: "Remove selected",
      // Freeform / panel labels (also used in player)
      pageBreadcrumb: "Editor",
      pageTitle: "Layout designer",
      pageSubtitle:
        "Configure the canvas, assemble components, and fine‑tune module spans before launching to the full‑screen player.",
      resetLayout: "Reset layout",
      rotateToPortrait: "Rotate to portrait",
      rotateToLandscape: "Rotate to landscape",
      viewFullscreen: "View full screen",
      ctaMonitorTitle: "Need to monitor content?",
      ctaMonitorBody:
        "Jump into the dashboard to track playback status, spot stale layouts, and coordinate with your signage team.",
      ctaOpenDashboard: "Open dashboard",
      panelLabel: "Panel",
      panelItemSingular: "item",
      panelItemPlural: "items",
      panelEmptyLabel: "Empty",
      panelMoreSuffix: "more",
      // Canvas preview
      canvasPreviewTitle: "Canvas preview",
      canvasSurfaceSuffix: "surface",
      canvasWidthSuffix: "width",
      canvasGridSuffix: "grid",
      orientationLandscapeLabel: "Landscape",
      orientationPortraitLabel: "Portrait",
      // Selected component panel – geometry & appearance
      dimensionWidthColumnsLabel: "Width (columns)",
      dimensionHeightRowsLabel: "Height (rows)",
      appearanceSectionTitle: "Appearance",
      appearanceBackgroundColorLabel: "Background color",
      appearanceTransparentBackgroundLabel: "Transparent background",
      appearanceShowBorderLabel: "Show border",
      appearanceBorderColorLabel: "Border color",
      appearanceTextColorLabel: "Text color",
      appearanceRoundedCornersLabel: "Rounded corners",
      appearanceBorderThicknessLabel: "Border thickness",
      timeFormatLabel: "Time format",
      noneOptionLabel: "None",
      // Freeform guidance
      freeformHint:
        "Drag empty cells to redraw the panel footprint, drop library items onto it to build the playlist, or adjust its size below.",
      // Clock options
      clockOptionsTitle: "Clock options",
      clockShowSecondsLabel: "Show seconds",
      clockShowDateLabel: "Show date",
      clockTimezoneLabel: "Timezone",
      clockStyleLabel: "Clock style",
      clockStyleDigitalLabel: "Digital",
      clockStyleAnalogLabel: "Analog",
      clockShowMultipleClocksLabel: "Show multiple clocks",
      clockSecondTimezoneLabel: "Second timezone",
      clockThirdTimezoneLabel: "Third timezone",
      clockFourthTimezoneLabel: "Fourth timezone",
      // Weather options
      weatherOptionsTitle: "Weather options",
      weatherLocationLabel: "Location",
      weatherShowAirQualityLabel: "Show air quality",
      weatherShowLocationForecastLabel: "Show location forecast",
      weatherShowTwoChartsLabel: "Show 2 charts",
      weatherSecondLocationLabel: "Second location",
      weatherMinLabel: "Min",
      weatherAvgLabel: "Avg",
      weatherMaxLabel: "Max",
      // News options
      newsOptionsTitle: "News options",
      newsFeedLabel: "News feed",
      newsShowSourceLabel: "Show source",
      newsMaxItemsLabel: "Max items",
      newsScrollSpeedLabel: "Scroll speed",
      // Announcement options
      announcementOptionsTitle: "Announcement options",
      announcementTextLabel: "Announcement text",
      // Branding options
      brandOptionsTitle: "Branding options",
      brandLogoUrlLabel: "Logo URL",
      brandTextLabel: "Branding text",
      brandTextPlaceholder: "Company name or tagline",
      // Calendar options
      calendarOptionsTitle: "Calendar options",
      calendarProviderLabel: "Calendar provider",
      calendarProviderDemoLabel: "Demo (sample data)",
      calendarProviderGoogleLabel: "Google Calendar",
      calendarProviderOutlookSoonLabel: "Outlook (coming soon)",
      calendarConnectGoogleButton: "Connect Google account",
      calendarConnectGoogleHelp:
        "Connect a Google account once, then choose Google Calendar to pull real events. Other providers will be added later.",
      calendarIdLabel: "Google calendar ID",
      calendarIdHelp:
        "Use \"primary\" for the main calendar, or enter a specific calendar ID.",
      calendarShowUpcomingLabel: "Show upcoming list",
      calendarAccentColorLabel: "Accent color",
      calendarMutedTextColorLabel: "Muted text color",
      calendarCellBackgroundLabel: "Cell background",
      calendarTodayHighlightLabel: "Today highlight",
      calendarEventColorsLabel: "Event colors (comma separated)",
      calendarEventColorsPlaceholder: "#d8b4fe, #bfdbfe, #fecdd3",
      calendarEventColorsHelp:
        "Leave empty to use the default pastel palette.",
      calendarHeaderLabel: "Calendar",
      calendarWeekPrefix: "Week",
      calendarTodayLabel: "Today",
      calendarUpcomingHeader: "Upcoming events",
      calendarNoUpcomingMessage: "No scheduled events this month.",
      calendarNoActivitiesToday: "No scheduled activities today.",
      calendarNoActivitiesMessage: "No scheduled activities.",
      calendarMoreEvents: "more...",
      calendarDisableAnimationsLabel: "Disable Animations",
      calendarWeekdayMon: "Mon",
      calendarWeekdayTue: "Tue",
      calendarWeekdayWed: "Wed",
      calendarWeekdayThu: "Thu",
      calendarWeekdayFri: "Fri",
      calendarWeekdaySat: "Sat",
      calendarWeekdaySun: "Sun",
      googleOAuthConnected: "Google account connected",
      googleOAuthNotConnected: "Google account not connected yet",
      // Transport options
      transportOptionsTitle: "Transport options",
      transportStopPlaceLabel: "Stop place",
      transportTimeFormatLabel: "Time format",
      transportMaxDeparturesLabel: "Max departures",
      transportShowDualStopsLabel: "Show dual stops",
      transportSecondStopPlaceLabel: "Second stop place",
      transportBadgeColorLabel: "Badge color",
      transportBadgeBorderColorLabel: "Badge border color",
      transportBadgeTextColorLabel: "Badge text color",
      transportDelayTextColorLabel: "Delay text color",
      transportBadgeRoundednessLabel: "Badge roundedness",
      transportNoDeparturesMessage: "No departures",
      transportNoDeparturesNowMessage: "No departures at the moment",
      transportLoadingSecondStopMessage: "Loading second stop…",
      transportPlatformLabel: "Platform",
      transportMinutesSuffix: "min",
      transportDelayMinutesPrefix: "+",
      // Media options
      mediaOptionsTitle: "Media options",
      mediaTypeLabel: "Media type",
      mediaTypeImageLabel: "Image",
      mediaTypeVideoLabel: "Video",
      mediaUrlsLabel: "Media URLs",
      mediaUrlsPlaceholder:
        "https://example.com/image1.jpg https://example.com/image2.jpg",
      mediaUrlsHelp:
        "Enter URLs separated by commas or spaces. One per line also works.",
      mediaAutoPlayLabel: "Auto-play carousel",
      mediaTransitionDurationLabel: "Transition duration",
      mediaEmptyMessage: "No media",
      mediaFallbackAlt: "Media",
      // Charts options
      chartsOptionsTitle: "Chart options",
      chartsEmptyMessage: "No chart data",
      chartsUnsupportedPrefix: "Unsupported:",
      chartsXAxisLabelPrefix: "X:",
      chartsYAxisLabelPrefix: "Y:",
      // Tasks options & player text
      tasksOptionsTitle: "Tasks options",
      tasksProviderLabel: "Tasks provider",
      tasksProviderDemoLabel: "Demo (sample data)",
      tasksProviderGoogleLabel: "Google Tasks",
      tasksProviderOutlookSoonLabel: "Outlook Tasks (coming soon)",
      tasksConnectGoogleButton: "Connect Google account",
      tasksConnectGoogleHelp:
        "Connect a Google account once, then choose Google Tasks to pull real tasks. Other providers will be added later.",
      tasksListIdLabel: "Google task list ID",
      tasksListIdPlaceholder: "Leave empty to use your first task list",
      tasksListIdHelp:
        "Use a specific list ID if you want to target a particular list.",
      tasksHeaderLabel: "TASKS",
      tasksEmptyMessage: "No tasks to display.",
      tasksDuePastPrefix: "",
      tasksDuePastSuffix: "d ago",
      tasksDueTodayLabel: "Today",
      tasksDueTomorrowLabel: "Tomorrow",
      tasksDueInPrefix: "In",
      tasksDueInSuffix: "d",
      // Solar (view + editor)
      solarOptionsTitle: "Solar",
      solarLocationLabel: "Position (location)",
      solarShowDayLength: "Show day length",
      solarShowSolarNoon: "Show solar noon",
      solarDawn: "Dawn",
      solarSunrise: "Sunrise",
      solarNoon: "Solar noon",
      solarSunset: "Sunset",
      solarDusk: "Dusk",
      solarDayLength: "Day length",
      solarNextDawn: "Dawn",
      solarNextSunrise: "Sunrise",
      solarNextSunset: "Sunset",
      solarNextDusk: "Dusk",
      solarNight: "Night",
      solarSearchPlaceholder: "Search location (e.g. Bergen, Oslo)",
      // Power (view)
      powerSourceLabel: "Hva koster strømmen.no",
      powerPricesToday: "Today's prices",
      powerPriceNow: "Now",
    },
  },
} as const;

type Namespace = keyof (typeof messages)[Locale];
type MessageKey<N extends Namespace> = keyof (typeof messages)[Locale][N];

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <N extends Namespace>(namespace: N, key: MessageKey<N>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem("sceneblikk_webapp_locale");
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }

  const browser = window.navigator.language?.toLowerCase() || "";
  if (browser.startsWith("nb") || browser.startsWith("no")) return "nb";
  if (browser.startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Align initial client locale with server-rendered default to avoid
  // hydration mismatches, then apply saved/browser locale after mount.
  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sceneblikk_webapp_locale", locale);
    }
  }, [locale]);

  const setLocale = (next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
  };

  const value: I18nContextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (namespace, key) => {
        const ns = messages[locale][namespace] as Record<string, string>;
        const fallbackNs = messages[DEFAULT_LOCALE][namespace] as Record<
          string,
          string
        >;
        return ns[key as string] || fallbackNs[key as string] || key.toString();
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}


