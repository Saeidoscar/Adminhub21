import { z } from "zod"

export const moderateContentSchema = z.object({
  postType: z.enum(["story", "blog"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  action: z.enum(["approve", "reject", "archive"]).optional(),
})

export type ModerateContentInput = z.infer<typeof moderateContentSchema>
