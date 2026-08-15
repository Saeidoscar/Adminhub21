<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminWalletTransactionListRequest;
use App\Services\Admin\AdminReportService;

class WalletTransactionController extends Controller
{
    public function index(
        AdminWalletTransactionListRequest $request,
        AdminReportService $reportService,
    ) {
        return response()->json(
            $reportService->walletTransactions($request->validated()),
        );
    }
}
