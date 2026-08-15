<?php

namespace App\Services\Admin;

use App\Models\Option;
use Illuminate\Database\Eloquent\Builder;

class AdminOptionService
{
    public function paginate(array $filters): array
    {
        $paginator = Option::query()
            ->when($filters['q'] ?? null, fn (Builder $query, string $search) => $query->where('key', 'like', "%{$search}%"))
            ->when($filters['group'] ?? null, fn (Builder $query, string $group) => $query->where('group', $group))
            ->orderBy('group')
            ->orderBy('key')
            ->paginate((int) ($filters['per_page'] ?? 30));

        return [
            'data' => collect($paginator->items())
                ->map(fn (Option $option) => $this->map($option))
                ->values(),
            'groups' => Option::query()
                ->distinct()
                ->orderBy('group')
                ->pluck('group')
                ->values(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    public function map(Option $option): array
    {
        $sensitive = $this->isSensitive($option->key);

        return [
            'id' => $option->id,
            'group' => $option->group,
            'key' => $option->key,
            'value' => $sensitive ? null : $option->value,
            'valueType' => $this->valueType($option->value),
            'isSensitive' => $sensitive,
            'hasValue' => $sensitive ? $this->hasValue($option->value) : null,
            'autoload' => $option->autoload,
            'updatedAt' => $option->updated_at?->toISOString(),
        ];
    }

    public function update(Option $option, array $data): Option
    {
        if ($this->isSensitive($option->key) && $this->isBlank($data['value'])) {
            unset($data['value']);
        }

        $option->fill($data)->save();

        Option::set(
            $option->key,
            $option->value,
            $option->group,
            $option->autoload,
        );

        return $option->refresh();
    }

    private function valueType(mixed $value): string
    {
        return match (true) {
            $value === null => 'null',
            is_string($value) => 'string',
            is_int($value), is_float($value) => 'number',
            is_bool($value) => 'boolean',
            is_array($value) && array_is_list($value) => 'array',
            is_array($value) => 'object',
            default => 'string',
        };
    }

    private function isSensitive(string $key): bool
    {
        return (bool) preg_match(
            '/(^|[._-])(secret|password|token|api[_-]?key|private[_-]?key|access[_-]?key|auth[_-]?key)([._-]|$)/i',
            $key,
        );
    }

    private function hasValue(mixed $value): bool
    {
        if (is_array($value)) {
            return $value !== [];
        }

        return $value !== null && $value !== '';
    }

    private function isBlank(mixed $value): bool
    {
        return $value === null || $value === '' || $value === [];
    }
}
