<?php

use App\Http\Controllers\Api\Webhooks\ZibalEbankWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/zibal/ebank/{token}', ZibalEbankWebhookController::class)
    ->where('token', '[A-Za-z0-9_-]+')
    ->name('webhooks.zibal.ebank');
