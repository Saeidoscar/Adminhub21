<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserListRequest;
use App\Services\Admin\AdminReportService;

class UserController extends Controller
{
    public function index(AdminUserListRequest $request, AdminReportService $reportService)
    {
        return response()->json($reportService->users(
            $request->validated(),
            $request->has('is_vendor'),
            $request->boolean('is_vendor'),
        ));
    }
}
