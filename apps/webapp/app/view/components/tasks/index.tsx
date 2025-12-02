"use client";

import { useMemo, useState, useEffect } from "react";
import { TasksSmall } from "./TasksSmall";
import { TasksMedium } from "./TasksMedium";
import { TasksXLarge } from "./TasksXLarge";
import { buildSampleTasksData } from "./utils";
import type { TasksProps, PanelSize, TasksData, Task } from "./types";

export function Tasks({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: TasksProps) {
  // Use example data for now - this will be replaced with Google Tasks API data
  const [tasksData, setTasksData] = useState<TasksData | null>(() => buildSampleTasksData());

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

  // For demonstration: simulate adding/removing tasks
  useEffect(() => {
    if (!tasksData) return;

    const interval = setInterval(() => {
      setTasksData((current) => {
        if (!current) return current;

        const currentTasks = current.tasks;
        // Randomly add or remove tasks for demo
        const shouldAdd = Math.random() > 0.7 && currentTasks.length < 10;
        const shouldRemove = Math.random() > 0.8 && currentTasks.length > 3;

        if (shouldAdd) {
          const newTask: Task = {
            id: `new-${Date.now()}`,
            title: `Ny oppgave ${currentTasks.length + 1}`,
            completed: false,
            status: "needsAction",
            priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
            taskListId: current.taskList.id,
            updated: new Date().toISOString(),
          };
          return {
            ...current,
            tasks: [...currentTasks, newTask],
            lastUpdated: new Date(),
          };
        }

        if (shouldRemove) {
          const incompleteTasks = currentTasks.filter((t) => !t.completed);
          if (incompleteTasks.length > 0) {
            const toRemove = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
            return {
              ...current,
              tasks: currentTasks.filter((t) => t.id !== toRemove.id),
              lastUpdated: new Date(),
            };
          }
        }

        return current;
      });
    }, 10000); // Change every 10 seconds for demo

    return () => clearInterval(interval);
  }, [tasksData]);

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
      />
    );
  } else if (fraction <= 1/2) {
    return (
      <TasksMedium
        appearance={appearance}
        tasksData={tasksData}
        onCompleteTopTask={handleCompleteTopTask}
        fadingOutTaskIds={fadingOutTaskIds}
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
      />
    );
  }
}

