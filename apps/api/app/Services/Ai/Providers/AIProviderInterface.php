<?php

namespace App\Services\Ai\Providers;

interface AIProviderInterface
{
    public function chat(array $messages, array $options = []): array;

    public function analyze(string $text, array $options = []): array;
}
