import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTasks } from "../../../lib/google";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const taskListId = searchParams.get("taskListId") ?? undefined;

  try {
    const { taskList, tasks } = await fetchGoogleTasks({
      taskListId,
      maxResults: 100,
    });

    return NextResponse.json({ taskList, tasks });
  } catch (error) {
    console.error("Failed to fetch Google Tasks:", error);

    // Allow client to fall back to demo data
    return NextResponse.json(
      { error: "Failed to load tasks from Google." },
      { status: 500 },
    );
  }
}


