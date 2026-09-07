import type { AiConversationRow, AiMessageRow, AiModelRow } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { AiConversationRow, AiMessageRow, AiModelRow }

export interface CreateConversationInput {
  title?: string
  modelId: string
}

export async function listModels(): Promise<AiModelRow[]> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/models")

  return unwrapList<AiModelRow>(payload, "models")
}

export async function listConversations(): Promise<AiConversationRow[]> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/conversations")

  return unwrapList<AiConversationRow>(payload, "conversations")
}

export async function getConversation(
  id: string,
): Promise<AiConversationRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${id}`,
  )

  return unwrapItem<AiConversationRow>(payload, "conversation")
}

export async function createConversation(
  input: CreateConversationInput,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/conversations", {
    method: "POST",

    body: JSON.stringify(input),
  })

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Conversation creation response was empty")
  }

  return conversation
}

export async function listMessages(
  conversationId: string,
): Promise<AiMessageRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/messages`,
  )

  return unwrapList<AiMessageRow>(payload, "messages")
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<AiMessageRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/messages`,
    {
      method: "POST",

      body: JSON.stringify({ content }),
    },
  )

  const message = unwrapItem<AiMessageRow>(payload, "message")

  if (!message) {
    throw new Error("Send message response was empty")
  }

  return message
}

export async function switchModel(
  conversationId: string,
  modelId: string,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/model`,
    {
      method: "PATCH",

      body: JSON.stringify({ modelId }),
    },
  )

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Switch model response was empty")
  }

  return conversation
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
  )

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Rename conversation response was empty")
  }

  return conversation
}

export async function deleteConversation(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/ai/conversations/${id}`, {
    method: "DELETE",
  })
}
