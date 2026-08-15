import { AIProvider, AIProviderError, AIConfigurationError, AICompletionResult, ChatMessage, ModelConfig, SendOptions } from "../ai-provider"

interface OpenAIResponse {
  choices: { message: { content: string }; finish_reason: string }[]
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export class OpenAIProvider implements AIProvider {
  constructor(private config: ModelConfig) {}

  async sendMessage(messages: ChatMessage[], options?: SendOptions): Promise<AICompletionResult> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new AIConfigurationError("OPENAI_API_KEY is not set")
    }

    const baseUrl = this.config.apiBaseUrl || "https://api.openai.com/v1"
    const model = options?.model || this.config.code
    const temperature = options?.temperature ?? this.config.defaultTemperature ?? 0.7
    const maxTokens = options?.maxTokens || this.config.maxOutputTokens || 1024

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      const sanitized = errorText.replace(/Bearer\s+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
        .replace(/api[_-]?key['":\s]+[A-Za-z0-9\-_]+/gi, "[REDACTED]")
      throw new AIProviderError(
        `OpenAI error: ${response.status} ${response.statusText} - ${sanitized.slice(0, 500)}`,
        response.status,
      )
    }

    const data = (await response.json()) as OpenAIResponse
    const choice = data.choices?.[0]
    const usage = data.usage

    if (!choice) {
      throw new AIProviderError("OpenAI returned no completion choices")
    }

    return {
      content: choice.message?.content || "",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      finishReason: choice.finish_reason,
    }
  }
}
