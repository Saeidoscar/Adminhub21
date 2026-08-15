import { z } from "zod"

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  modelId: z.string().trim().max(60),
})

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
})

export const switchModelSchema = z.object({
  modelId: z.string().trim().max(60),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type SwitchModelInput = z.infer<typeof switchModelSchema>

export const aiMessageResponseSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.string(),
  content: z.string(),
  provider: z.string().optional(),
  modelCode: z.string().optional(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  inputCost: z.number().optional(),
  outputCost: z.number().optional(),
  totalCost: z.number().optional(),
  responseTimeMs: z.number().optional(),
  createdAt: z.string(),
})

export const aiConversationResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  modelId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const aiModelResponseSchema = z.object({
  id: z.string(),
  provider: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  inputCost: z.number(),
  outputCost: z.number(),
  contextWindow: z.number().optional(),
  apiBaseUrl: z.string().optional(),
  defaultTemperature: z.number().optional(),
  maxOutputTokens: z.number().optional(),
  supportsStreaming: z.boolean(),
  supportsVision: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AiMessageResponse = z.infer<typeof aiMessageResponseSchema>
export type AiConversationResponse = z.infer<typeof aiConversationResponseSchema>
export type AiModelResponse = z.infer<typeof aiModelResponseSchema>
