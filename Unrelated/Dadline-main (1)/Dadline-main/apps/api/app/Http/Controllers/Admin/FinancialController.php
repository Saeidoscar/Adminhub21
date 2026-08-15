<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminFinancialListRequest;
use App\Services\Admin\AdminReportService;

class FinancialController extends Controller
{
    public function index(
        AdminFinancialListRequest $request,
        AdminReportService $reportService,
    ) {
        return response()->json(
            $reportService->financials($request->validated()),
        );
    }
}
