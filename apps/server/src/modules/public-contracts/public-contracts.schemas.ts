import { z } from "zod"

export const getPublicContractSchema = z.object({
  code: z.string().trim().min(1).max(120),
})

export type GetPublicContractInput = z.infer<typeof getPublicContractSchema>
