"use client";

import { TasksSmall } from "./TasksSmall";
import type { TasksProps, TasksData } from "./types";

type TasksMediumProps = TasksProps & {
  tasksData: TasksData | null;
  onCompleteTopTask?: () => void;
  fadingOutTaskIds?: Set<string>;
};

export function TasksMedium({
  appearance,
  tasksData,
  onCompleteTopTask,
  fadingOutTaskIds,
  orientation,
}: TasksMediumProps) {
  return (
    <TasksSmall
      appearance={appearance}
      tasksData={tasksData}
      onCompleteTopTask={onCompleteTopTask}
      fadingOutTaskIds={fadingOutTaskIds}
      maxTasks={8}
      orientation={orientation}
    />
  );
}





