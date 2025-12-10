import { google } from "googleapis";
import {
  getAuthorizedOAuthClient,
  type StoredTokens,
} from "./google-oauth";

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

export async function fetchGoogleCalendarEvents(
  input: {
    calendarId?: string;
    timeMin: string;
    timeMax: string;
    maxResults?: number;
  },
  tokens: StoredTokens,
): Promise<GoogleCalendarEvent[]> {
  const auth = getAuthorizedOAuthClient(tokens);
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

export async function fetchGoogleTasks(
  input: {
    taskListId?: string;
    maxResults?: number;
  },
  tokens: StoredTokens,
): Promise<{
  taskList: GoogleTasksList | null;
  tasks: GoogleTaskItem[];
}> {
  const auth = getAuthorizedOAuthClient(tokens);
  const tasksApi = google.tasks({ version: "v1", auth });

  let taskListId = input.taskListId;
  let taskList: GoogleTasksList | null = null;

  if (!taskListId) {
    try {
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
    } catch (error) {
      console.error("Failed to fetch Google Task Lists:", error);
      throw error;
    }
  }

  if (!taskListId) {
    return {
      taskList: null,
      tasks: [],
    };
  }

  let tasksResponse;
  try {
    tasksResponse = await tasksApi.tasks.list({
      tasklist: taskListId,
      showCompleted: false,
      showDeleted: false,
      maxResults: input.maxResults ?? 50,
    });
  } catch (error: any) {
    console.error("Failed to fetch tasks from Google Tasks API:", error);
    // If the error is 404 (list not found), return null taskList
    if (error?.code === 404 || error?.response?.status === 404) {
      console.warn(`Task list ${taskListId} not found`);
      return {
        taskList: null,
        tasks: [],
      };
    }
    throw error;
  }

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

  // If taskList wasn't set earlier (when taskListId was provided), create it now
  if (!taskList) {
    // Try to get the task list details to get the actual title
    try {
      const taskListResponse = await tasksApi.tasklists.get({
        tasklist: taskListId,
      });
      if (taskListResponse.data.id && taskListResponse.data.title) {
        taskList = {
          id: taskListResponse.data.id,
          title: taskListResponse.data.title,
          updated: taskListResponse.data.updated ?? undefined,
        };
      }
    } catch (error) {
      // If we can't get the list details, create a default one
      console.warn("Could not fetch task list details, using default title");
    }
    
    // Fallback to default if we still don't have a taskList
    if (!taskList) {
      taskList = {
        id: taskListId,
        title: "Oppgaver",
        updated: tasks[0]?.updated ?? undefined,
      };
    }
  }

  return {
    taskList,
    tasks,
  };
}


