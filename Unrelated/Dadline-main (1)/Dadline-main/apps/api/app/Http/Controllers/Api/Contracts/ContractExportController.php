<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;

class ContractExportController extends Controller
{
    public function pdf(Contract $contract): JsonResponse
    {
        $this->authorize('view', $contract);

        return response()->json([
            'message' => 'Contract PDF export is not configured yet. Use the evidence-report endpoint for the signed evidence package.',
        ], 501);
    }
}
