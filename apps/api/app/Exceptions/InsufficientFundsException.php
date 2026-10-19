<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Thrown by wallet actions when the withdrawable balance cannot cover an
 * operation. Rendered as 422 so a client gets a usable message instead of a
 * 500 from an uncaught RuntimeException.
 */
class InsufficientFundsException extends RuntimeException
{
    public function __construct(string $message = 'Insufficient withdrawable balance.')
    {
        parent::__construct($message);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
