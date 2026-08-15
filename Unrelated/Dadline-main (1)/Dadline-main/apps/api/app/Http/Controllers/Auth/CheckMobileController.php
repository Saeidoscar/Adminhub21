<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CheckMobileRequest;
use App\Models\User;

class CheckMobileController extends Controller
{
    public function check(CheckMobileRequest $request)
    {
        $mobile = $request->validated('mobile');
        $user = User::where('mobile', $mobile)->first();

        return response()->json([
            'exists' => $user !== null,
            'firstName' => $user?->first_name,
        ]);
    }
}
