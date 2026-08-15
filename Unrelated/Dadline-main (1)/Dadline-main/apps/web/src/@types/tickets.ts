export type TicketStatus = "open" | "answered" | "referred" | "pending" | "closed"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export type TicketPerson = {
  id: number
  name: string
  mobile: string | null
  role: string
  roleLabel: string
  avatarUrl: string | null
}

export type TicketDepartment = {
  id: number
  slug: string
  label: string
  isActive: boolean
  isDefault: boolean
  sortOrder: number
}

export type TicketAttachment = {
  id: number
  name: string | null
  mimeType: string | null
  sizeBytes: number | null
  url: string | null
}

export type TicketMessage = {
  id: number
  body: string
  actorType: "user" | "support" | "provider"
  isInternal: boolean
  isMine: boolean
  createdAt: string | null
  user: {
    id: number
    name: string
    role: string | null
    roleLabel: string | null
    avatarUrl: string | null
  }
  attachment: TicketAttachment | null
}

export type Ticket = {
  uuid: string
  title: string
  status: TicketStatus
  statusLabel: string
  priority: TicketPriority
  priorityLabel: string
  hasUnread: boolean
  createdAt: string | null
  updatedAt: string | null
  lastMessageAt: string | null
  activityAt: string | null
  closedAt: string | null
  department: TicketDepartment
  sender?: TicketPerson | null
  assignedTo?: TicketPerson | null
  provider?: TicketPerson | null
  lastMessage?: TicketMessage | null
  messages?: TicketMessage[]
  permissions: {
    canReply: boolean
    canChangeStatus: boolean
    canManage: boolean
  }
}

export type TicketMeta = {
  departments: TicketDepartment[]
  priorities: Record<TicketPriority, string>
  statuses: Record<TicketStatus, string>
  defaults: {
    priority: TicketPriority
    department: string
  }
}

export type TicketPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}
