<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminListRequest;
use App\Http\Requests\Admin\UpdateOptionRequest;
use App\Models\Option;
use App\Services\Admin\AdminOptionService;

class OptionController extends Controller
{
    public function index(AdminListRequest $request, AdminOptionService $optionService)
    {
        return response()->json(
            $optionService->paginate($request->validated()),
        );
    }

    public function update(
        UpdateOptionRequest $request,
        Option $option,
        AdminOptionService $optionService,
    ) {
        $updated = $optionService->update($option, $request->validated());

        return response()->json([
            'message' => 'تنظیم با موفقیت به‌روزرسانی شد.',
            'data' => $optionService->map($updated),
        ]);
    }
}
