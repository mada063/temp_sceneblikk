import type { CellAppearance, Orientation } from "../../../lib/layout-types";

export type TasksProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
  orientation?: Orientation;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type TasksData = {
  taskList: TaskList;
  tasks: Task[];
  lastUpdated?: Date;
};

export type TaskList = {
  id: string;
  title: string;
  updated?: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  status?: "needsAction" | "completed";
  priority?: "low" | "medium" | "high";
  category?: string;
  dueDate?: string;
  due?: string; // ISO 8601 format from Google Tasks
  notes?: string;
  updated?: string;
  position?: string;
  // Google Tasks specific fields
  taskListId?: string;
};

