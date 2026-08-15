<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('http://localhost:8000/api/documentation');
});