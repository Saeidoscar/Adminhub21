import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    nameEn: z.string().trim().min(1, "Name is required"),
    nameFa: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().optional(),
    role: z.enum(["employer", "admin"]),
  })
  .refine((data) => data.nameEn.trim().length > 0, {
    message: "Name is required",
    path: ["nameEn"],
  })

export const otpSchema = z.object({
  phone: z.string().trim().min(10, "Valid phone number is required"),
  code: z.string().trim().length(6, "Code must be 6 digits"),
})

export const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  category: z.enum(["billing", "technical", "account", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
})

export const adminUserSchema = z.object({
  nameEn: z.string().trim().max(120).optional(),
  nameFa: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  role: z.enum(["employer", "admin", "super_admin"]).optional(),
})

export const caseSchema = z.object({
  employerId: z.string().uuid("Invalid employer ID"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
})

export const taskSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  assignedTo: z.string().uuid().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done", "blocked"]).default("todo"),
  priority: z.string().trim().max(40).default("medium"),
  dueDate: z.string().trim().optional().nullable(),
})

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  startAt: z.string().trim().min(1, "Start date is required"),
  endAt: z.string().trim().min(1, "End date is required"),
  allDay: z.boolean().default(false),
  color: z.string().trim().max(20).default("#1e3a5f"),
})

export const timeLogSchema = z.object({
  caseId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  description: z.string().trim().min(1, "Description is required").max(500),
  startedAt: z.string().trim().min(1, "Start time is required"),
  endedAt: z.string().trim().min(1, "End time is required"),
})

export const portfolioSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000),
  mediaUrl: z.string().url("Invalid URL").max(500),
  mediaType: z.enum(["image", "video", "link"]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
})

export const packageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  type: z.enum(["platform", "bundle"]),
  platforms: z.array(z.string().min(1)).min(1, "Select at least one platform"),
  priceToman: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a valid number",
    }),
  priceUSD: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a valid number",
    }),
  billingCycle: z.enum(["monthly", "project", "hourly"]),
  deliveryTime: z.string().trim().min(1, "Delivery time is required"),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

export const contractSchema = z.object({
  employerName: z.string().trim().min(1, "Employer name is required"),
  adminName: z.string().trim().min(1, "Admin name is required"),
  employerCo: z.string().trim().optional(),
  projectTitle: z.string().trim().min(1, "Project title is required"),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description is required"),
  deliverables: z.string().trim().optional(),
  amountToman: z
    .string()
    .trim()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Amount must be a valid number",
    }),
  amountUSD: z
    .string()
    .trim()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Amount must be a valid number",
    }),
  currency: z.enum(["toman", "usd"]),
  paySchedule: z.string().trim().optional(),
  termClause: z.string().trim().optional(),
  substituteClause: z.string().trim().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OtpInput = z.infer<typeof otpSchema>
export type TicketInput = z.infer<typeof ticketSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
export type CaseInput = z.infer<typeof caseSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type EventInput = z.infer<typeof eventSchema>
export type TimeLogInput = z.infer<typeof timeLogSchema>
export type PortfolioInput = z.infer<typeof portfolioSchema>
export type PackageInput = z.infer<typeof packageSchema>
export type ContractInput = z.infer<typeof contractSchema>
