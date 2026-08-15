import { z } from "zod"

const personSchema = z.object({
  id: z.number(),
  name: z.string(),
  mobile: z.string().nullable(),
  role: z.string(),
  roleLabel: z.string(),
  avatarUrl: z.string().nullable(),
})

export const ticketDepartmentSchema = z.object({
  id: z.number(),
  slug: z.string(),
  label: z.string(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
})

const ticketAttachmentSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  url: z.string().nullable(),
})

export const ticketMessageSchema = z.object({
  id: z.number(),
  body: z.string(),
  actorType: z.enum(["user", "support", "provider"]),
  isInternal: z.boolean(),
  isMine: z.boolean(),
  createdAt: z.string().nullable(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string().nullable(),
    roleLabel: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  attachment: ticketAttachmentSchema.nullable(),
})

export const ticketSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  status: z.enum(["open", "answered", "referred", "pending", "closed"]),
  statusLabel: z.string(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  priorityLabel: z.string(),
  hasUnread: z.boolean(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
  activityAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  department: ticketDepartmentSchema,
  sender: personSchema.nullable().optional(),
  assignedTo: personSchema.nullable().optional(),
  provider: personSchema.nullable().optional(),
  lastMessage: ticketMessageSchema.nullable().optional(),
  messages: z.array(ticketMessageSchema).optional(),
  permissions: z.object({
    canReply: z.boolean(),
    canChangeStatus: z.boolean(),
    canManage: z.boolean(),
  }),
})

export const ticketResponseSchema = z.object({ data: ticketSchema })

export const ticketListResponseSchema = z.object({
  data: z.array(ticketSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
})

export const ticketMetaResponseSchema = z.object({
  data: z.object({
    departments: z.array(ticketDepartmentSchema),
    priorities: z.record(
      z.enum(["low", "normal", "high", "urgent"]),
      z.string(),
    ),
    statuses: z.record(
      z.enum(["open", "answered", "referred", "pending", "closed"]),
      z.string(),
    ),
    defaults: z.object({
      priority: z.enum(["low", "normal", "high", "urgent"]),
      department: z.string(),
    }),
  }),
})

export const ticketMessageResponseSchema = z.object({
  data: ticketMessageSchema,
})
