import { z } from "zod"

const nullableDate = z.string().nullable()
const paginationSchema = z.object({
  currentPage: z.number(),
  lastPage: z.number(),
  perPage: z.number(),
  total: z.number(),
})

export const adminLoginResponseSchema = z.object({
  data: z.object({
    token: z.string().min(1),
    user: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      fullName: z.string(),
      mobile: z.string(),
      email: z.string().nullable(),
      role: z.literal("admin"),
      roles: z.array(z.literal("admin")),
    }),
  }),
})

const dashboardUserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  mobile: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  roleLabel: z.string(),
  isVendor: z.boolean(),
  walletBalance: z.number(),
  registeredAt: nullableDate,
  lastLoginAt: nullableDate,
})

const transactionUserSchema = z.object({
  id: z.number().nullable(),
  fullName: z.string(),
  mobile: z.string().nullable(),
})

export const adminTransactionSchema = z.object({
  id: z.number(),
  user: transactionUserSchema,
  amount: z.number(),
  direction: z.string(),
  directionLabel: z.string(),
  type: z.string().nullable(),
  typeLabel: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  settlementStatus: z.string().nullable().optional(),
  trackId: z.string().nullable().optional(),
  createdAt: nullableDate,
})

const operationCountsSchema = z.object({
  pendingVendorApplications: z.number(),
  openTickets: z.number(),
  activeContracts: z.number(),
  pendingOrders: z.number(),
  activeServiceRequests: z.number(),
  activeConsultations: z.number(),
  failedExternalServices: z.number(),
})

export const dashboardResponseSchema = z.object({
  data: z.object({
    generatedAt: z.string(),
    summary: z.object({
      users: z.object({
        total: z.number(),
        vendors: z.number(),
        admins: z.number(),
        today: z.number(),
        lastThirtyDays: z.number(),
      }),
      finance: z.object({
        income: z.number(),
        expense: z.number(),
        net: z.number(),
        walletBalance: z.number(),
        completedDeposits: z.number(),
        completedWithdrawals: z.number(),
        pendingWithdrawals: z.number(),
      }),
      operations: operationCountsSchema,
    }),
    financialTrend: z.array(
      z.object({
        date: z.string(),
        income: z.number(),
        expense: z.number(),
      }),
    ),
    recentUsers: z.array(dashboardUserSchema),
    recentTransactions: z.array(adminTransactionSchema),
  }),
})

export const usersResponseSchema = z.object({
  data: z.array(
    dashboardUserSchema.extend({
      firstName: z.string(),
      lastName: z.string(),
      walletStatus: z.string().nullable(),
    }),
  ),
  meta: paginationSchema,
  filters: z.object({
    roles: z.record(z.string(), z.string()),
  }),
})

export const transactionsResponseSchema = z.object({
  data: z.array(
    adminTransactionSchema.extend({
      user: transactionUserSchema.extend({
        email: z.string().nullable(),
      }),
    }),
  ),
  summary: z.object({
    count: z.number(),
    deposits: z.number(),
    withdrawals: z.number(),
    completed: z.number(),
  }),
  meta: paginationSchema,
  filters: z.object({
    directions: z.record(z.string(), z.string()),
    statuses: z.record(z.string(), z.string()),
    types: z.record(z.string(), z.string()),
  }),
})

export const financialsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      direction: z.string(),
      directionLabel: z.string(),
      grossAmount: z.number(),
      vatAmount: z.number(),
      netAmount: z.number(),
      status: z.string(),
      statusLabel: z.string(),
      itemId: z.number().nullable(),
      occurredAt: nullableDate,
    }),
  ),
  summary: z.object({
    income: z.number(),
    expense: z.number(),
    net: z.number(),
    vat: z.number(),
  }),
  meta: paginationSchema,
  filters: z.object({
    directions: z.record(z.string(), z.string()),
    statuses: z.record(z.string(), z.string()),
  }),
})

export const operationsResponseSchema = z.object({
  data: z.object({
    counts: operationCountsSchema,
    vendorApplications: z.array(
      z.object({
        id: z.number(),
        user: z.string(),
        mobile: z.string().nullable(),
        targetRole: z.string(),
        targetRoleLabel: z.string(),
        status: z.string(),
        price: z.number(),
        createdAt: nullableDate,
      }),
    ),
    tickets: z.array(
      z.object({
        uuid: z.string(),
        title: z.string(),
        sender: z.string(),
        mobile: z.string().nullable(),
        status: z.string(),
        updatedAt: nullableDate,
      }),
    ),
    contracts: z.array(
      z.object({
        uuid: z.string(),
        title: z.string(),
        creator: z.string(),
        status: z.string(),
        createdAt: nullableDate,
      }),
    ),
    orders: z.array(
      z.object({
        id: z.number(),
        buyer: z.string(),
        mobile: z.string().nullable(),
        totalPrice: z.number(),
        status: z.string(),
        createdAt: nullableDate,
      }),
    ),
    serviceRequests: z.array(
      z.object({
        uuid: z.string(),
        title: z.string(),
        requester: z.string(),
        type: z.string(),
        status: z.string(),
        statusLabel: z.string(),
        createdAt: nullableDate,
      }),
    ),
    consultations: z.array(
      z.object({
        id: z.number(),
        user: z.string(),
        vendor: z.string().nullable(),
        minutes: z.number(),
        price: z.number(),
        status: z.string(),
        createdAt: nullableDate,
      }),
    ),
    externalServices: z.array(
      z.object({
        uuid: z.string(),
        user: z.string().nullable(),
        provider: z.string(),
        service: z.string(),
        status: z.string(),
        durationMs: z.number().nullable(),
        billable: z.boolean(),
        billedAmount: z.number().nullable(),
        createdAt: nullableDate,
      }),
    ),
  }),
})

export const optionSchema = z.object({
  id: z.number(),
  group: z.string(),
  key: z.string(),
  value: z.unknown().nullable(),
  valueType: z.enum(["null", "string", "number", "boolean", "array", "object"]),
  isSensitive: z.boolean(),
  hasValue: z.boolean().nullable(),
  autoload: z.boolean(),
  updatedAt: nullableDate,
})

export const optionsResponseSchema = z.object({
  data: z.array(optionSchema),
  groups: z.array(z.string()),
  meta: paginationSchema,
})

export type AdminDashboard = z.infer<typeof dashboardResponseSchema>["data"]
export type AdminUser = z.infer<typeof usersResponseSchema>["data"][number]
export type AdminTransaction = z.infer<typeof transactionsResponseSchema>["data"][number]
export type AdminFinancial = z.infer<typeof financialsResponseSchema>["data"][number]
export type AdminOperations = z.infer<typeof operationsResponseSchema>["data"]
export type AdminOption = z.infer<typeof optionSchema>
export type PaginationMeta = z.infer<typeof paginationSchema>

const ticketPersonSchema = z.object({
  id: z.number(),
  name: z.string(),
  mobile: z.string(),
  role: z.string(),
  roleLabel: z.string(),
  avatarUrl: z.string().nullable().optional(),
})

export const adminTicketDepartmentSchema = z.object({
  id: z.number(),
  slug: z.string(),
  label: z.string(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
  supporters: z.array(ticketPersonSchema).optional(),
})

const adminTicketAttachmentSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  url: z.string().nullable(),
})

export const adminTicketMessageSchema = z.object({
  id: z.number(),
  body: z.string(),
  actorType: z.enum(["user", "support", "provider"]),
  isInternal: z.boolean(),
  isMine: z.boolean(),
  createdAt: nullableDate,
  user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string().nullable(),
    roleLabel: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  attachment: adminTicketAttachmentSchema.nullable(),
})

export const adminTicketSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  status: z.enum(["open", "answered", "referred", "pending", "closed"]),
  statusLabel: z.string(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  priorityLabel: z.string(),
  hasUnread: z.boolean(),
  createdAt: nullableDate,
  updatedAt: nullableDate,
  lastMessageAt: nullableDate,
  activityAt: nullableDate,
  closedAt: nullableDate,
  department: adminTicketDepartmentSchema,
  sender: ticketPersonSchema.nullable().optional(),
  assignedTo: ticketPersonSchema.nullable().optional(),
  provider: ticketPersonSchema.nullable().optional(),
  lastMessage: adminTicketMessageSchema.nullable().optional(),
  messages: z.array(adminTicketMessageSchema).optional(),
  permissions: z.object({
    canReply: z.boolean(),
    canChangeStatus: z.boolean(),
    canManage: z.boolean(),
  }),
})

export const adminTicketFiltersSchema = z.object({
  departments: z.array(adminTicketDepartmentSchema),
  supporters: z.array(ticketPersonSchema),
  statuses: z.record(z.string(), z.string()),
  priorities: z.record(z.string(), z.string()),
})

export const adminTicketsResponseSchema = z.object({
  data: z.array(adminTicketSchema),
  meta: z.object({
    currentPage: z.number(),
    lastPage: z.number(),
    perPage: z.number(),
    total: z.number(),
  }),
  filters: adminTicketFiltersSchema,
})

export const adminTicketResponseSchema = z.object({ data: adminTicketSchema })
export const adminTicketMessageResponseSchema = z.object({
  data: adminTicketMessageSchema,
})
export const adminTicketMetaResponseSchema = z.object({
  data: adminTicketFiltersSchema.extend({
    providers: z.array(ticketPersonSchema),
  }),
})
export const adminTicketDepartmentsResponseSchema = z.object({
  data: z.array(adminTicketDepartmentSchema),
})

export type AdminTicket = z.infer<typeof adminTicketSchema>
export type AdminTicketMessage = z.infer<typeof adminTicketMessageSchema>
export type AdminTicketDepartment = z.infer<typeof adminTicketDepartmentSchema>
export type AdminTicketFilters = z.infer<typeof adminTicketFiltersSchema>
export type AdminTicketMeta = z.infer<typeof adminTicketMetaResponseSchema>["data"]
