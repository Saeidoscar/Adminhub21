import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { aiConversations, aiModels, aiMessages, users } from "../../db/schema"
import type { CreateConversationInput } from "./ai.schemas"
import {
  AIConfigurationError,
  AIProviderError,
  type AICompletionResult,
  type ChatMessage,
  type ModelConfig,
} from "../../lib/ai/ai-provider"
import { createProvider } from "../../lib/ai/provider-factory"

export type AiConversationRow = {
  id: string
  userId: string
  title: string
  modelId: string
  createdAt: string
  updatedAt: string
}

export type AiMessageRow = {
  id: string
  conversationId: string
  role: string
  content: string
  provider?: string
  modelCode?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  inputCost?: number
  outputCost?: number
  totalCost?: number
  responseTimeMs?: number
  createdAt: string
}

export type AiModelRow = {
  id: string
  provider: string
  code: string
  name: string
  description?: string
  inputCost: number
  outputCost: number
  contextWindow?: number
  apiBaseUrl?: string
  defaultTemperature?: number
  maxOutputTokens?: number
  supportsStreaming: boolean
  supportsVision: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function toSafeConversation(row: {
  id: string
  userId: string
  title: string
  modelId: string
  createdAt: Date
  updatedAt: Date
}): AiConversationRow {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    modelId: row.modelId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toSafeMessage(row: {
  id: string
  conversationId: string
  role: string
  content: string
  provider?: string | null
  modelCode?: string | null
  promptTokens?: number | null
  completionTokens?: number | null
  totalTokens?: number | null
  inputCost?: number | null
  outputCost?: number | null
  totalCost?: number | null
  responseTimeMs?: number | null
  createdAt: Date
}): AiMessageRow {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role,
    content: row.content,
    provider: row.provider ?? undefined,
    modelCode: row.modelCode ?? undefined,
    promptTokens: row.promptTokens ?? undefined,
    completionTokens: row.completionTokens ?? undefined,
    totalTokens: row.totalTokens ?? undefined,
    inputCost: row.inputCost ?? undefined,
    outputCost: row.outputCost ?? undefined,
    totalCost: row.totalCost ?? undefined,
    responseTimeMs: row.responseTimeMs ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }
}

function toSafeModel(row: {
  id: string
  provider: string
  code: string
  name: string
  description?: string | null
  inputCost: number
  outputCost: number
  contextWindow?: number | null
  apiBaseUrl?: string | null
  defaultTemperature?: number | null
  maxOutputTokens?: number | null
  supportsStreaming: boolean
  supportsVision: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): AiModelRow {
  return {
    id: row.id,
    provider: row.provider,
    code: row.code,
    name: row.name,
    description: row.description ?? undefined,
    inputCost: row.inputCost,
    outputCost: row.outputCost,
    contextWindow: row.contextWindow ?? undefined,
    apiBaseUrl: row.apiBaseUrl ?? undefined,
    defaultTemperature: row.defaultTemperature ?? undefined,
    maxOutputTokens: row.maxOutputTokens ?? undefined,
    supportsStreaming: row.supportsStreaming,
    supportsVision: row.supportsVision,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function sanitizeProviderError(error: unknown): string {
  if (error instanceof AIProviderError) {
    let message = error.message
    if (message.length > 500) {
      message = message.slice(0, 500) + "..."
    }
    message = message.replace(/Bearer\s+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
    message = message.replace(/api[_-]?key['":\s]+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
    return message
  }
  if (error instanceof Error) {
    return error.message.slice(0, 500)
  }
  return "Unknown AI provider error"
}

export async function createConversation(
  userId: string,
  data: CreateConversationInput,
): Promise<AiConversationRow> {
  const [model] = await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.id, data.modelId))
    .limit(1)

  if (!model || !model.isActive) {
    throw new Error("Invalid or inactive model")
  }

  const [row] = await db
    .insert(aiConversations)
    .values({
      userId,
      title: data.title,
      modelId: data.modelId,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create conversation")
  }

  return toSafeConversation(row)
}

export async function listConversations(
  userId: string,
): Promise<AiConversationRow[]> {
  const rows = await db
    .select({
      id: aiConversations.id,
      userId: aiConversations.userId,
      title: aiConversations.title,
      modelId: aiConversations.modelId,
      createdAt: aiConversations.createdAt,
      updatedAt: aiConversations.updatedAt,
    })
    .from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.updatedAt))

  return rows.map(toSafeConversation)
}

export async function getConversation(
  id: string,
  userId: string,
): Promise<AiConversationRow | null> {
  const [row] = await db
    .select({
      id: aiConversations.id,
      userId: aiConversations.userId,
      title: aiConversations.title,
      modelId: aiConversations.modelId,
      createdAt: aiConversations.createdAt,
      updatedAt: aiConversations.updatedAt,
    })
    .from(aiConversations)
    .where(eq(aiConversations.id, id))
    .limit(1)

  if (!row) return null

  if (row.userId !== userId) {
    return null
  }

  return toSafeConversation(row)
}

const MAX_HISTORY_MESSAGES = 50

async function getConversationMessagesForProvider(
  conversationId: string,
  maxMessages = MAX_HISTORY_MESSAGES,
): Promise<ChatMessage[]> {
  const historyRows = await db
    .select({
      id: aiMessages.id,
      role: aiMessages.role,
      content: aiMessages.content,
    })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt)
    .limit(maxMessages)

  return historyRows.map((row) => ({
    role: row.role as ChatMessage["role"],
    content: row.content,
  }))
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string,
): Promise<AiMessageRow> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw new Error("Conversation not found or access denied")
  }

  if (conversation.userId !== userId) {
    throw new Error("Conversation not found or access denied")
  }

  const [model] = await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.id, conversation.modelId))
    .limit(1)

  if (!model) {
    throw new Error("Model not found")
  }

  const history = await getConversationMessagesForProvider(conversationId)

  const [userMessage] = await db
    .insert(aiMessages)
    .values({
      conversationId,
      role: "user",
      content,
    })
    .returning()

  if (!userMessage) {
    throw new Error("Failed to save user message")
  }

  const messages = [...history, { role: "user" as const, content }]

  const providerConfig: ModelConfig = {
    id: model.id,
    provider: model.provider,
    code: model.code,
    name: model.name,
    description: model.description ?? undefined,
    inputCost: model.inputCost,
    outputCost: model.outputCost,
    contextWindow: model.contextWindow ?? undefined,
    apiBaseUrl: model.apiBaseUrl ?? undefined,
    defaultTemperature: model.defaultTemperature ?? undefined,
    maxOutputTokens: model.maxOutputTokens ?? undefined,
    supportsStreaming: model.supportsStreaming,
    supportsVision: model.supportsVision,
    isActive: model.isActive,
  }

  const provider = createProvider(providerConfig)

  const startTime = Date.now()
  let result: AICompletionResult
  try {
    result = await provider.sendMessage(messages)
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw new Error(sanitizeProviderError(error))
    }
    if (error instanceof AIConfigurationError) {
      throw new Error(`AI configuration error: ${error.message}`)
    }
    throw error
  }
  const responseTimeMs = Date.now() - startTime

  const promptTokens = result.promptTokens ?? 0
  const completionTokens = result.completionTokens ?? 0
  const totalTokens = result.totalTokens ?? promptTokens + completionTokens
  const inputCost = promptTokens * model.inputCost
  const outputCost = completionTokens * model.outputCost
  const totalCost = inputCost + outputCost

  const assistantMessage = await db.transaction(async (tx) => {
    const [assistantMessage] = await tx
      .insert(aiMessages)
      .values({
        conversationId,
        role: "assistant",
        content: result.content,
        provider: model.provider,
        modelCode: model.code,
        promptTokens,
        completionTokens,
        totalTokens,
        inputCost,
        outputCost,
        totalCost,
        responseTimeMs,
      })
      .returning()

    if (!assistantMessage) {
      throw new Error("Failed to save assistant message")
    }

    await tx
      .update(aiConversations)
      .set({ updatedAt: new Date() })
      .where(eq(aiConversations.id, conversationId))

    return assistantMessage
  })

  return toSafeMessage(assistantMessage)
}

export async function switchModel(
  userId: string,
  conversationId: string,
  modelId: string,
): Promise<AiConversationRow> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw new Error("Conversation not found or access denied")
  }

  if (conversation.userId !== userId) {
    throw new Error("Conversation not found or access denied")
  }

  const [model] = await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.id, modelId))
    .limit(1)

  if (!model) {
    throw new Error("Model not found")
  }

  if (!model.isActive) {
    throw new Error("Model is not active")
  }

  const [updated] = await db
    .update(aiConversations)
    .set({ modelId: model.id, updatedAt: new Date() })
    .where(eq(aiConversations.id, conversationId))
    .returning()

  if (!updated) {
    throw new Error("Failed to switch model")
  }

  return toSafeConversation(updated)
}

export async function getAvailableModels(): Promise<AiModelRow[]> {
  const rows = await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.isActive, true))
    .orderBy(aiModels.code)

  return rows.map(toSafeModel)
}

export async function listMessages(
  conversationId: string,
  userId: string,
): Promise<AiMessageRow[]> {
  const conversation = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1)

  if (!conversation[0]) {
    throw new Error("Conversation not found or access denied")
  }

  if (conversation[0].userId !== userId) {
    throw new Error("Conversation not found or access denied")
  }

  const rows = await db
    .select({
      id: aiMessages.id,
      conversationId: aiMessages.conversationId,
      role: aiMessages.role,
      content: aiMessages.content,
      provider: aiMessages.provider,
      modelCode: aiMessages.modelCode,
      promptTokens: aiMessages.promptTokens,
      completionTokens: aiMessages.completionTokens,
      totalTokens: aiMessages.totalTokens,
      inputCost: aiMessages.inputCost,
      outputCost: aiMessages.outputCost,
      totalCost: aiMessages.totalCost,
      responseTimeMs: aiMessages.responseTimeMs,
      createdAt: aiMessages.createdAt,
    })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt)

  return rows.map(toSafeMessage)
}

export async function renameConversation(
  userId: string,
  conversationId: string,
  title: string,
): Promise<AiConversationRow> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw new Error("Conversation not found or access denied")
  }

  if (conversation.userId !== userId) {
    throw new Error("Conversation not found or access denied")
  }

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error("Title cannot be empty")
  }

  if (trimmedTitle.length > 200) {
    throw new Error("Title must be 200 characters or fewer")
  }

  const [updated] = await db
    .update(aiConversations)
    .set({ title: trimmedTitle, updatedAt: new Date() })
    .where(eq(aiConversations.id, conversationId))
    .returning()

  if (!updated) {
    throw new Error("Failed to rename conversation")
  }

  return toSafeConversation(updated)
}

export async function deleteConversation(
  userId: string,
  conversationId: string,
): Promise<void> {
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw new Error("Conversation not found or access denied")
  }

  if (conversation.userId !== userId) {
    throw new Error("Conversation not found or access denied")
  }

  await db
    .delete(aiConversations)
    .where(eq(aiConversations.id, conversationId))
}
