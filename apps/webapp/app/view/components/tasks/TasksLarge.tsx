"use client";

import { useTaskAnimations, TASKS_ANIMATION } from "./useTaskAnimations";
import type { TasksProps, TasksData, Task } from "./types";
import { FiCheckCircle, FiCircle, FiAlertCircle } from "react-icons/fi";
import { hexToRgba } from "../calendar/utils";

type TasksLargeProps = TasksProps & {
  tasksData: TasksData | null;
  onCompleteTopTask?: () => void;
  fadingOutTaskIds?: Set<string>;
};

export function TasksLarge({
  appearance,
  tasksData,
  onCompleteTopTask,
  fadingOutTaskIds = new Set(),
  orientation,
}: TasksLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const mutedColor = appearance.textColor
    ? hexToRgba(appearance.textColor, 0.65)
    : "#ffffff80";
  const borderColor = hexToRgba(primaryColor, 0.25);
  const rowBackground = hexToRgba(primaryColor, 0.05);
  const isPortrait = orientation === "portrait";

  const taskList = tasksData?.taskList;
  const allTasks = tasksData?.tasks ?? [];
  // Show incomplete tasks + fading tasks (fading tasks are still incomplete, just visually fading)
  const incompleteTasks = allTasks.filter((t) => !t.completed);
  const tasks = incompleteTasks;
  const hasIncompleteTasks = incompleteTasks.length > 0;
  
  // Pass incomplete tasks to animation hook (matches transport pattern)
  // Fading tasks are still incomplete, so they're included
  // When removed after fade-out, hook will detect and trigger slide-up
  const { playInitialFade, shouldSlideUp, newItemIds } = useTaskAnimations(incompleteTasks);
  
  // Don't slide up while tasks are fading out - wait for fade-out to complete
  const canSlideUp = shouldSlideUp && fadingOutTaskIds.size === 0;
  const totalTasks = tasks.length;
  const initialStaggerSeconds = TASKS_ANIMATION.initialStagger / 1000;
  const slideUpCompletionDelaySeconds = TASKS_ANIMATION.slideUpDuration / 1000;
  const fadeBufferSeconds = TASKS_ANIMATION.newFadeExtraDelay / 1000;
  let newTaskCounter = 0;

  const getPriorityColor = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return mutedColor;
    }
  };

  const formatDueDate = (task: Task) => {
    const dueStr = task.due || task.dueDate;
    if (!dueStr) return null;
    
    const date = new Date(dueStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `For ${Math.abs(diffDays)} d. siden`;
    if (diffDays === 0) return "I dag";
    if (diffDays === 1) return "I morgen";
    return `Om ${diffDays} d.`;
  };

  if (!tasksData || totalTasks === 0) {
    return (
      <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
        {taskList && (
          <header className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.35em]"
                style={{ color: mutedColor }}
              >
                OPPGAVER
              </p>
              <p className="text-2xl font-semibold leading-tight" style={{ color: primaryColor }}>{taskList.title}</p>
            </div>
          </header>
        )}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="text-base font-medium text-center"
            style={{ color: mutedColor }}
          >
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.35em]"
            style={{ color: mutedColor }}
          >
            OPPGAVER
          </p>
          <p className="text-2xl font-semibold leading-tight">{taskList?.title}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {tasks.map((task, index) => {
          const isFadingOut = fadingOutTaskIds.has(task.id);
          const isNew = newItemIds.has(task.id);
          const isInitialSequence = playInitialFade && totalTasks > 0;
          const currentNewIndex = isNew ? newTaskCounter++ : undefined;
          
          // If fading out, use fade-out animation; otherwise match transport pattern
          const rowAnimationClass = isFadingOut
            ? "animate-fade-out"
            : isInitialSequence
            ? "animate-slide-up-bounce"
            : isNew
            ? "animate-fade-in"
            : "";
          
          let rowAnimationDelay: string | undefined;
          if (isInitialSequence) {
            rowAnimationDelay = `${(totalTasks - index - 1) * initialStaggerSeconds}s`;
          } else if (isNew && currentNewIndex !== undefined && !isFadingOut) {
            const delaySeconds =
              (shouldSlideUp ? slideUpCompletionDelaySeconds : 0) +
              fadeBufferSeconds +
              currentNewIndex * initialStaggerSeconds;
            rowAnimationDelay = `${delaySeconds}s`;
          }

          const rowBaseStyle =
            isInitialSequence
              ? { opacity: 0, transform: "translateY(50%)" }
              : isNew
              ? { opacity: 0 }
              : undefined;
          

          const dueDateText = formatDueDate(task);
          const priorityColor = getPriorityColor(task.priority);

          const rowShapeClasses = isPortrait
            ? "rounded-2xl px-3 py-2"
            : "rounded-2xl bg-white/5 p-4";

          return (
            <div
              key={task.id}
              className={`flex items-start gap-3 transition-transform duration-300 ease-out ${
                isFadingOut ? "animate-fade-out pointer-events-none" : ""
              } ${rowShapeClasses} ${rowAnimationClass}`}
              style={{
                borderColor,
                backgroundColor: isPortrait ? rowBackground : undefined,
                ...rowBaseStyle,
                animationDelay: rowAnimationDelay,
                animationFillMode: rowAnimationClass ? "forwards" : undefined,
              }}
            >
              <div className="shrink-0 mt-0.5">
                <FiCircle
                  className="h-5 w-5"
                  style={{ color: mutedColor }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-base font-medium"
                  style={{ color: primaryColor }}
                >
                  {task.title}
                </div>
                {(task.category || dueDateText || task.priority) && (
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {task.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          color: primaryColor,
                          backgroundColor: `${primaryColor}15`,
                        }}
                      >
                        {task.category}
                      </span>
                    )}
                    {dueDateText && (
                      <span
                        className="text-xs"
                        style={{ color: mutedColor }}
                      >
                        {dueDateText}
                      </span>
                    )}
                    {task.priority && (
                      <div className="flex items-center gap-1">
                        <FiAlertCircle
                          className="h-3 w-3"
                          style={{ color: priorityColor }}
                        />
                        <span
                          className="text-xs capitalize"
                          style={{ color: priorityColor }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
