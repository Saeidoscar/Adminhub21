import { z } from "zod"

export const notificationPreferencesSchema = z.object({
  smsEnabled: z.boolean(),
  botEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  eitaaEnabled: z.boolean(),
  baleEnabled: z.boolean(),
  smsBalance: z.number(),
  quietHoursStart: z.string().nullable(),
  quietHoursEnd: z.string().nullable(),
  timezone: z.string(),
})

export const smsPackageSchema = z.object({
  units: z.number(),
  unitPrice: z.number(),
  discountPercent: z.number(),
  originalPrice: z.number(),
  price: z.number(),
  affordable: z.boolean(),
})

export const notificationSettingsResponseSchema = z.object({
  data: z.object({
    preferences: notificationPreferencesSchema,
    wallet: z.object({
      balance: z.number(),
    }),
    sms: z.object({
      feePerSms: z.number(),
      packages: z.array(smsPackageSchema),
    }),
  }),
})

export const notificationMutationResponseSchema =
  notificationSettingsResponseSchema.extend({
    message: z.string(),
  })

export type NotificationSettings = z.infer<typeof notificationSettingsResponseSchema>["data"]

export type NotificationMutationState = {
  status: "idle" | "success" | "error"
  message: string | null
  fieldErrors?: Partial<Record<"smsEnabled" | "botEnabled" | "pushEnabled" | "emailEnabled" | "eitaaEnabled" | "baleEnabled" | "quietHoursStart" | "quietHoursEnd" | "units" | "wallet", string[]>>
}
