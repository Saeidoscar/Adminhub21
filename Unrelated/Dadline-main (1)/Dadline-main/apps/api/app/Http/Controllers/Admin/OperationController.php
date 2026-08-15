<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminOperationService;

class OperationController extends Controller
{
    public function __invoke(AdminOperationService $operationService)
    {
        return response()->json([
            'data' => $operationService->overview(),
        ]);
    }
}
