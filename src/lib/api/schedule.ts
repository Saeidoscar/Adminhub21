import type { CaseRow, EventRow, TaskRow, TimeLogRow } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { CaseRow, EventRow, TaskRow, TimeLogRow }

export async function listAdminCases(
  query: {
    status?: string
    priority?: string
    search?: string
  } = {},
): Promise<CaseRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.priority) params.set("priority", query.priority)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/cases${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CaseRow>(payload, "cases")
}

export async function getAdminCase(id: string): Promise<CaseRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/cases/${id}`)
  return unwrapItem<CaseRow>(payload, "case")
}

export async function createAdminCase(data: {
  employerId: string
  title: string
  description: string
  priority?: string
  tags?: string[]
}): Promise<CaseRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/cases", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const case_ = unwrapItem<CaseRow>(payload, "case")
  if (!case_) {
    throw new Error("Create case response was empty")
  }
  return case_
}

export async function updateAdminCase(
  id: string,
  data: Partial<{
    title: string
    description: string
    priority: string
    status: string
    tags: string[]
  }>,
): Promise<CaseRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const case_ = unwrapItem<CaseRow>(payload, "case")
  if (!case_) {
    throw new Error("Update case response was empty")
  }
  return case_
}

export async function listAdminTasks(caseId: string): Promise<TaskRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tasks/case/${encodeURIComponent(caseId)}`,
  )
  return unwrapList<TaskRow>(payload, "tasks")
}

export async function getAdminTask(id: string): Promise<TaskRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tasks/${id}`)
  return unwrapItem<TaskRow>(payload, "task")
}

export async function createAdminTask(data: {
  caseId: string
  title: string
  description: string
  assignedTo?: string
  status?: string
  priority?: string
  dueDate?: string
}): Promise<TaskRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const task = unwrapItem<TaskRow>(payload, "task")
  if (!task) {
    throw new Error("Create task response was empty")
  }
  return task
}

export async function updateAdminTask(
  id: string,
  data: Partial<{
    title: string
    description: string
    assignedTo: string
    status: string
    priority: string
    dueDate: string
  }>,
): Promise<TaskRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const task = unwrapItem<TaskRow>(payload, "task")
  if (!task) {
    throw new Error("Update task response was empty")
  }
  return task
}

export async function listAdminEvents(
  query: {
    from?: string
    to?: string
  } = {},
): Promise<EventRow[]> {
  const params = new URLSearchParams()
  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/events${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<EventRow>(payload, "events")
}

export async function getAdminEvent(id: string): Promise<EventRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/events/${id}`)
  return unwrapItem<EventRow>(payload, "event")
}

export async function createAdminEvent(data: {
  title: string
  description?: string
  startAt: string
  endAt: string
  allDay?: boolean
  color?: string
}): Promise<EventRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/events", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const event = unwrapItem<EventRow>(payload, "event")
  if (!event) {
    throw new Error("Create event response was empty")
  }
  return event
}

export async function updateAdminEvent(
  id: string,
  data: Partial<{
    title: string
    description: string
    startAt: string
    endAt: string
    allDay: boolean
    color: string
  }>,
): Promise<EventRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const event = unwrapItem<EventRow>(payload, "event")
  if (!event) {
    throw new Error("Update event response was empty")
  }
  return event
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/events/${id}`, {
    method: "DELETE",
  })
}

export async function listAdminTimeLogs(
  query: {
    caseId?: string
    taskId?: string
  } = {},
): Promise<TimeLogRow[]> {
  const params = new URLSearchParams()
  if (query.caseId) params.set("caseId", query.caseId)
  if (query.taskId) params.set("taskId", query.taskId)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/time-logs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<TimeLogRow>(payload, "timeLogs")
}

export async function getAdminTimeLog(id: string): Promise<TimeLogRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/time-logs/${id}`,
  )
  return unwrapItem<TimeLogRow>(payload, "timeLog")
}

export async function createAdminTimeLog(data: {
  caseId?: string
  taskId?: string
  description: string
  startedAt: string
  endedAt: string
}): Promise<TimeLogRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/time-logs", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const timeLog = unwrapItem<TimeLogRow>(payload, "timeLog")
  if (!timeLog) {
    throw new Error("Create time log response was empty")
  }
  return timeLog
}

export async function updateAdminTimeLog(
  id: string,
  data: Partial<{
    caseId: string | null
    taskId: string | null
    description: string
    startedAt: string
    endedAt: string
  }>,
): Promise<TimeLogRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/time-logs/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  )
  const timeLog = unwrapItem<TimeLogRow>(payload, "timeLog")
  if (!timeLog) {
    throw new Error("Update time log response was empty")
  }
  return timeLog
}

export async function deleteAdminTimeLog(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/time-logs/${id}`, {
    method: "DELETE",
  })
}

export async function deleteAdminTask(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/tasks/${id}`, {
    method: "DELETE",
  })
}
