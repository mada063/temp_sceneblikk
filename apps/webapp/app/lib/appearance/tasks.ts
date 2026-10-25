export type TasksAppearance = {
  tasksProvider?: "demo" | "google";
  tasksListId?: string;
};

export const tasksAppearanceDefaults: Required<
  Pick<TasksAppearance, "tasksProvider" | "tasksListId">
> = {
  tasksProvider: "demo",
  tasksListId: "",
};
