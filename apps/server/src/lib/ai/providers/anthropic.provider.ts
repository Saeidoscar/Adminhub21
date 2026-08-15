import { AIProvider, AIProviderError, AIConfigurationError, AICompletionResult, ChatMessage, ModelConfig, SendOptions } from "../ai-provider"

interface AnthropicResponse {
  content: { text: string }[]
  usage: { input_tokens: number; output_tokens: number }
  stop_reason?: string
}

export class AnthropicProvider implements AIProvider {
  constructor(private config: ModelConfig) {}

  async sendMessage(messages: ChatMessage[], options?: SendOptions): Promise<AICompletionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new AIConfigurationError("ANTHROPIC_API_KEY is not set")
    }

    const baseUrl = this.config.apiBaseUrl || "https://api.anthropic.com/v1"
    const model = options?.model || this.config.code
    const temperature = options?.temperature ?? this.config.defaultTemperature ?? 0.7
    const maxTokens = options?.maxTokens || this.config.maxOutputTokens || 1024

    const systemMessage = messages.find((m) => m.role === "system")
    const chatMessages = messages.filter((m) => m.role !== "system")

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
    }

    if (systemMessage) {
      body.system = systemMessage.content
    }

    if (temperature !== undefined) {
      body.temperature = temperature
    }

    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      const sanitized = errorText.replace(/Bearer\s+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
        .replace(/api[_-]?key['":\s]+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
      throw new AIProviderError(
        `Anthropic error: ${response.status} ${response.statusText} - ${sanitized.slice(0, 500)}`,
        response.status,
      )
    }

    const data = (await response.json()) as AnthropicResponse

    return {
      content: data.content?.[0]?.text || "",
      promptTokens: data.usage?.input_tokens,
      completionTokens: data.usage?.output_tokens,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      finishReason: data.stop_reason,
    }
  }
}
