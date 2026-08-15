import { AIProvider, AIConfigurationError, ModelConfig } from "./ai-provider"
import { AnthropicProvider } from "./providers/anthropic.provider"
import { OpenAIProvider } from "./providers/openai.provider"
import { OpenRouterProvider } from "./providers/openrouter.provider"

export function createProvider(config: ModelConfig): AIProvider {
  if (!config.isActive) {
    throw new AIConfigurationError(`Model ${config.code} is not active`)
  }

  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config)
    case "anthropic":
      return new AnthropicProvider(config)
    case "openrouter":
      return new OpenRouterProvider(config)
    default:
      throw new AIConfigurationError(`Unsupported provider: ${config.provider}`)
  }
}
