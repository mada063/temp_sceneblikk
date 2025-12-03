import { google } from "googleapis";
import { getAuthorizedOAuthClient } from "./google-oauth";

type GoogleCalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end?: string | null;
  allDay: boolean;
};

type GoogleTasksList = {
  id: string;
  title: string;
  updated?: string;
};

type GoogleTaskItem = {
  id: string;
  title: string;
  status?: string | null;
  due?: string | null;
  notes?: string | null;
  updated?: string | null;
  position?: string | null;
};

export async function fetchGoogleCalendarEvents(input: {
  calendarId?: string;
  timeMin: string;
  timeMax: string;
  maxResults?: number;
}): Promise<GoogleCalendarEvent[]> {
  const auth = await getAuthorizedOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.list({
    calendarId: input.calendarId ?? "primary",
    timeMin: input.timeMin,
    timeMax: input.timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: input.maxResults ?? 100,
  });

  const items = response.data.items ?? [];

  return items
    .filter((event) => Boolean(event.start))
    .map((event) => {
      const start = event.start;
      const end = event.end;

      const startIso =
        start?.dateTime ??
        (start?.date ? `${start.date}T00:00:00.000Z` : new Date().toISOString());
      const endIso =
        end?.dateTime ??
        (end?.date ? `${end.date}T23:59:59.000Z` : null);

      const allDay = Boolean(start?.date && !start?.dateTime);

      return {
        id: event.id ?? `${startIso}-${event.summary ?? "event"}`,
        summary: event.summary ?? "Uten tittel",
        start: startIso,
        end: endIso,
        allDay,
      };
    });
}

export async function fetchGoogleTasks(input: {
  taskListId?: string;
  maxResults?: number;
}): Promise<{
  taskList: GoogleTasksList | null;
  tasks: GoogleTaskItem[];
}> {
  const auth = await getAuthorizedOAuthClient();
  const tasksApi = google.tasks({ version: "v1", auth });

  let taskListId = input.taskListId;
  let taskList: GoogleTasksList | null = null;

  if (!taskListId) {
    const taskListsResponse = await tasksApi.tasklists.list({
      maxResults: 1,
    });
    const firstList = taskListsResponse.data.items?.[0];
    if (!firstList || !firstList.id) {
      return {
        taskList: null,
        tasks: [],
      };
    }
    taskListId = firstList.id;
    taskList = {
      id: firstList.id,
      title: firstList.title ?? "Oppgaver",
      updated: firstList.updated ?? undefined,
    };
  }

  const tasksResponse = await tasksApi.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
    showDeleted: false,
    maxResults: input.maxResults ?? 50,
  });

  const items = tasksResponse.data.items ?? [];

  const tasks: GoogleTaskItem[] = items
    .filter((task) => Boolean(task.title) && Boolean(task.id))
    .map((task) => ({
      id: task.id ?? "",
      title: task.title ?? "",
      status: task.status ?? undefined,
      due: task.due ?? undefined,
      notes: task.notes ?? undefined,
      updated: task.updated ?? undefined,
      position: task.position ?? undefined,
    }))
    // Keep tasks in API order (usually by due date / position)
    .sort((a, b) => {
      if (a.due && b.due) {
        return a.due.localeCompare(b.due);
      }
      if (a.due && !b.due) return -1;
      if (!a.due && b.due) return 1;
      return 0;
    });

  if (!taskList) {
    taskList = {
      id: taskListId,
      title: "Oppgaver",
      updated: tasks[0]?.updated ?? undefined,
    };
  }

  return {
    taskList,
    tasks,
  };
}


