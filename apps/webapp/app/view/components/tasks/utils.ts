import type { TasksData, Task, TaskList } from "./types";

/**
 * Builds example task data for demonstration purposes.
 * Mimics the structure that would come from Google Tasks API.
 */
export function buildSampleTasksData(): TasksData {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatISO = (date: Date) => date.toISOString();

  const taskList: TaskList = {
    id: "example-task-list-1",
    title: "Arbeidsoppgaver",
    updated: formatISO(now),
  };

  const tasks: Task[] = [
    {
      id: "1",
      title: "Forbered presentasjon for teammøte",
      completed: false,
      status: "needsAction",
      priority: "high",
      dueDate: formatDate(tomorrow),
      due: formatISO(tomorrow),
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "2",
      title: "Fullfør månedsrapport",
      completed: false,
      status: "needsAction",
      priority: "medium",
      dueDate: formatDate(now),
      due: formatISO(now),
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "3",
      title: "Gjennomgå kontrakt med ny klient",
      completed: false,
      status: "needsAction",
      priority: "high",
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "4",
      title: "Oppdater prosjektplanlegger",
      completed: true,
      status: "completed",
      priority: "low",
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "5",
      title: "Planlegg teamretreat",
      completed: false,
      status: "needsAction",
      priority: "medium",
      dueDate: formatDate(nextWeek),
      due: formatISO(nextWeek),
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "6",
      title: "Bestill kontorrekvisita",
      completed: false,
      status: "needsAction",
      priority: "low",
      taskListId: taskList.id,
      updated: formatISO(now),
    },
    {
      id: "7",
      title: "Send oppfølging til kunder",
      completed: false,
      status: "needsAction",
      priority: "medium",
      taskListId: taskList.id,
      updated: formatISO(now),
    },
  ];

  return {
    taskList,
    tasks,
    lastUpdated: now,
  };
}

/**
 * Legacy function for backwards compatibility - returns just tasks array.
 */
export function buildSampleTasks(): Task[] {
  return buildSampleTasksData().tasks;
}

