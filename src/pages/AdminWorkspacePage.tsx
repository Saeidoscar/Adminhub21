import { useState } from "react"
import { t, type Lang } from "../i18n"
import {
  listAdminCases,
  getAdminCase,
  createAdminCase,
  updateAdminCase,
  listAdminTasks,
  getAdminTask,
  createAdminTask,
  updateAdminTask,
  listAdminEvents,
  getAdminEvent,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  listAdminTimeLogs,
  getAdminTimeLog,
  createAdminTimeLog,
  type CaseRow,
  type TaskRow,
  type EventRow,
  type TimeLogRow,
} from "../lib/api"
import { ListSkeleton, UserCardSkeleton } from "../components/ui/Skeleton"
import type { Tr, TabKey } from "./admin-workspace/utils"
import CasesTab from "./admin-workspace/CasesTab"
import TasksTab from "./admin-workspace/TasksTab"
import EventsTab from "./admin-workspace/EventsTab"
import TimeLogsTab from "./admin-workspace/TimeLogsTab"

export default function AdminWorkspacePage({
  tr,
  lang,
}: {
  tr: Tr
  lang: Lang
}) {
  const isFa = lang === "fa"
  const [activeTab, setActiveTab] = useState<TabKey>("cases")

  const tabs: { key: TabKey; label: string }[] = [
    { key: "cases", label: tr.adminWorkspace.cases },
    { key: "tasks", label: tr.adminWorkspace.tasks },
    { key: "events", label: tr.adminWorkspace.events },
    { key: "timeLogs", label: tr.adminWorkspace.timeLogs },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminWorkspace.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminWorkspace.sub}</p>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-press ${
              activeTab === tab.key
                ? "bg-[#1e3a5f] text-white"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "cases" && <CasesTab tr={tr} lang={lang} isFa={isFa} />}
      {activeTab === "tasks" && <TasksTab tr={tr} lang={lang} isFa={isFa} />}
      {activeTab === "events" && <EventsTab tr={tr} lang={lang} isFa={isFa} />}
      {activeTab === "timeLogs" && (
        <TimeLogsTab tr={tr} lang={lang} isFa={isFa} />
      )}
    </div>
  )
}
