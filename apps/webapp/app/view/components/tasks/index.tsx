"use client";

import { useMemo, useState, useEffect } from "react";
import { TasksSmall } from "./TasksSmall";
import { TasksMedium } from "./TasksMedium";
import { TasksXLarge } from "./TasksXLarge";
import { buildSampleTasksData } from "./utils";
import type { TasksProps, PanelSize, TasksData, Task } from "./types";

export function Tasks({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
  orientation,
}: TasksProps) {
  const [tasksData, setTasksData] = useState<TasksData | null>(() =>
    appearance.tasksProvider === "google" ? null : buildSampleTasksData(),
  );

  // Load tasks from Google Tasks when explicitly configured; otherwise keep demo data
  useEffect(() => {
    if (appearance.tasksProvider !== "google") {
      // Ensure demo data is used when Google integration is not selected
      setTasksData(buildSampleTasksData());
      return;
    }

    const abortController = new AbortController();

    const load = async (controller: AbortController = abortController) => {
      try {
        const params = new URLSearchParams();
        if (appearance.tasksListId && appearance.tasksListId.trim() !== "") {
          params.set("taskListId", appearance.tasksListId.trim());
        }

        const response = await fetch(`/api/google/tasks${params.toString() ? `?${params.toString()}` : ""}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          // eslint-disable-next-line no-console
          console.error("Google Tasks API returned non-OK response:", response.status, response.statusText, errorText, "- using demo data instead.");
          setTasksData(buildSampleTasksData());
          return;
        }

        const data: {
          error?: string;
          details?: string;
          code?: string;
          taskList?: {
            id: string;
            title: string;
            updated?: string;
          } | null;
          tasks?: Array<{
            id: string;
            title: string;
            status?: "needsAction" | "completed";
            due?: string;
            notes?: string;
            updated?: string;
          }>;
        } = await response.json();

        // Debug logging
        // eslint-disable-next-line no-console
        console.log("Google Tasks API response:", {
          hasError: !!data.error,
          error: data.error,
          hasTaskList: !!data.taskList,
          taskList: data.taskList,
          tasksCount: data.tasks?.length ?? 0,
          tasks: data.tasks,
        });

        // Check if the response contains an error field
        if (data.error) {
          // eslint-disable-next-line no-console
          console.error("Google Tasks API returned error:", data.error, data.details || "", data.code || "", "- using demo data instead.");
          setTasksData(buildSampleTasksData());
          return;
        }

        const incomingTasks = data.tasks ?? [];
        if (!data.taskList) {
          // No task list returned – this could mean no task lists exist or API error
          // eslint-disable-next-line no-console
          console.warn("Google Tasks API returned no task list - using demo data instead. Response data:", data);
          setTasksData(buildSampleTasksData());
          return;
        }
        
        // Allow empty task lists - don't fall back to demo data if taskList exists but is empty
        // This allows users to see an empty state rather than fake demo data
        // Only use demo data if we have a task list but it's truly empty (no tasks)
        // However, if taskList exists, we should show it even if empty

        const now = new Date();
        const mappedTasks: Task[] = incomingTasks.map((task) => {
          const completed = task.status === "completed";
          const dueDateOnly = task.due ? task.due.split("T")[0] : undefined;

          let priority: "low" | "medium" | "high" | undefined;
          if (task.due) {
            const dueDate = new Date(task.due);
            const diffMs = dueDate.getTime() - now.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays < 0) priority = "high";
            else if (diffDays <= 2) priority = "medium";
            else priority = "low";
          }

          return {
            id: task.id,
            title: task.title,
            completed,
            status: task.status,
            priority,
            dueDate: dueDateOnly,
            due: task.due,
            notes: task.notes,
            updated: task.updated,
            taskListId: data.taskList?.id,
          };
        });

        setTasksData({
          taskList: {
            id: data.taskList.id,
            title: data.taskList.title,
            updated: data.taskList.updated,
          },
          tasks: mappedTasks,
          lastUpdated: new Date(),
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Tasks, falling back to demo data:", error);
        setTasksData(buildSampleTasksData());
      }
    };

    // Load immediately on mount or when dependencies change
    load().catch(() => {
      // Swallow top-level errors – inner try/catch already logs and falls back
    });

    // Set up polling interval: fetch every 30 minutes (30 * 60 * 1000 ms)
    const intervalId = setInterval(() => {
      // Create a new abort controller for each interval call
      const intervalAbortController = new AbortController();
      load(intervalAbortController).catch(() => {
        // Swallow top-level errors – inner try/catch already logs and falls back
      });
    }, 30 * 60 * 1000);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [appearance.tasksProvider, appearance.tasksListId]);

  // Calculate panel size for responsive display
  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;

    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }

    const fraction = panelArea / totalGridSize;

    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  const [fadingOutTaskIds, setFadingOutTaskIds] = useState<Set<string>>(new Set());

  const handleCompleteTopTask = () => {
    let completedTaskId: string | null = null;
    
    setTasksData((current) => {
      if (!current) return current;

      const incompleteTasks = current.tasks.filter((t) => !t.completed);
      if (incompleteTasks.length === 0) return current;

      const topTask = incompleteTasks[0];
      completedTaskId = topTask.id;
      
      // Mark as fading out - task will fade out visually but stay in list
      setFadingOutTaskIds((prev) => new Set(prev).add(topTask.id));
      
      // Return unchanged - task stays in list during fade-out
      return current;
    });

    // After fade-out completes, remove the task to trigger smooth slide-up
    if (completedTaskId) {
      setTimeout(() => {
        setTasksData((current) => {
          if (!current) return current;
          
          // Remove the task - animation hook will detect and trigger smooth slide-up
          const remainingTasks = current.tasks.filter((t) => t.id !== completedTaskId);
          
          // Clear fading state
          setFadingOutTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(completedTaskId!);
            return next;
          });
          
          return {
            ...current,
            tasks: remainingTasks,
            lastUpdated: new Date(),
          };
        });
      }, 250); // Match fade-out duration
    }
  };

  // Calculate fraction for determining task display
  const fraction = useMemo(() => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    
    if (!totalGridSize || totalGridSize === 0) {
      return 0; // Default to smallest size if no grid size
    }
    
    return panelArea / totalGridSize;
  }, [colSpan, rowSpan, totalGridSize]);

  // Render based on fraction
  // 1/12 or less (<= 0.083): show 1 task
  // 1/4 or less (<= 0.25): show 3 tasks
  // 1/2 or less (<= 0.5): show 8 tasks
  // 1/1 (1.0, full size): show all tasks in 2 columns
  if (fraction <= 1/12) {
    return (
      <TasksSmall
        appearance={appearance}
        tasksData={tasksData}
        onCompleteTopTask={handleCompleteTopTask}
        fadingOutTaskIds={fadingOutTaskIds}
        maxTasks={1}
        orientation={orientation}
      />
    );
  } else if (fraction <= 1/4) {
    return (
      <TasksSmall
        appearance={appearance}
        tasksData={tasksData}
        onCompleteTopTask={handleCompleteTopTask}
        fadingOutTaskIds={fadingOutTaskIds}
        maxTasks={3}
        orientation={orientation}
      />
    );
  } else if (fraction <= 1/2) {
    return (
      <TasksMedium
        appearance={appearance}
        tasksData={tasksData}
        onCompleteTopTask={handleCompleteTopTask}
        fadingOutTaskIds={fadingOutTaskIds}
        orientation={orientation}
      />
    );
  } else {
    // Full size (1/1) - show all tasks in 2 columns
    return (
      <TasksXLarge
        appearance={appearance}
        tasksData={tasksData}
        onCompleteTopTask={handleCompleteTopTask}
        fadingOutTaskIds={fadingOutTaskIds}
        orientation={orientation}
      />
    );
  }
}

