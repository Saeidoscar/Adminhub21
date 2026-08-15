export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AICompletionResult {
  content: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  finishReason?: string
}

export interface ModelConfig {
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
}

export interface SendOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIProvider {
  sendMessage(
    messages: ChatMessage[],
    options?: SendOptions,
  ): Promise<AICompletionResult>
}

export class AIProviderError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = "AIProviderError"
  }
}

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AIConfigurationError"
  }
}
