import { z } from "zod"

const absoluteUrlSchema = z
  .string()
  .url()
  .refine((url) => ["http:", "https:"].includes(new URL(url).protocol))

const internalPathSchema = z
  .string()
  .max(2048)
  .startsWith("/")
  .refine((path) => !path.startsWith("//"))

export const shortLinkPathSchema = internalPathSchema

export const createShortLinkResponseSchema = z
  .object({
    data: z.object({
      short_code: z.string().regex(/^[A-Za-z0-9]{1,10}$/),
    }),
  })
  .transform(({ data }) => ({
    shortCode: data.short_code,
  }))

export const shortLinkResponseSchema = z
  .object({
    data: z.object({
      original_url: z.union([internalPathSchema, absoluteUrlSchema]),
    }),
  })
  .transform(({ data }) => ({
    originalUrl: data.original_url,
  }))
