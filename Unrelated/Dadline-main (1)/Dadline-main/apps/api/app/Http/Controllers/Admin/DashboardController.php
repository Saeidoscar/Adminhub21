<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;

class DashboardController extends Controller
{
    public function __invoke(AdminDashboardService $dashboardService)
    {
        return response()->json([
            'data' => $dashboardService->build(),
        ]);
    }
}
