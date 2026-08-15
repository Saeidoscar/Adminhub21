import type { AiModelRow } from "@adminhub/shared"
import { Icon } from "../layout/Icon"

export function ModelSelector({
  models,
  selectedModelId,
  onSelect,
}: {
  models: AiModelRow[]
  selectedModelId: string
  onSelect: (modelId: string) => void
}) {
  const selected = models.find((m) => m.id === selectedModelId)

  return (
    <div className="relative">
      <select
        value={selectedModelId}
        onChange={(e) => onSelect(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-border bg-surface px-3 pr-8 text-sm text-foreground outline-none focus:border-primary"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
      <Icon
        name="chevronRight"
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted"
      />
    </div>
  )
}
