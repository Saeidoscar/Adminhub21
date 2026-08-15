<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\File;



Route::prefix('v1')->group(base_path('routes/api/v1.php'));
// Route::prefix('v2')->group(base_path('routes/api/v2.php'));


Route::post('/upload', function (Request $request) {
    $request->validate([
        'file' => 'required|file|max:10240',
    ]);

    $file = $request->file('file');

    $path = $file->store('uploads', [
        'disk' => 's3',
        'metadata' => [
            'user_id' => '454654654654',
            'file_type' => $file->getClientOriginalExtension(),
            'original_name' => $file->getClientOriginalName(),
            'uploaded_at' => now()->toIso8601String(),
        ],
    ]);

    return response()->json([
        'message' => 'فایل با موفقیت آپلود شد!',
        'path' => $path,
    ]);
});

Route::delete('/files/{fileId}', function (int $fileId) {
    // ۱. پیدا کردن رکورد فایل در دیتابیس

    // ۲. حذف فیزیکی فایل از آروان (S3)
    
    $delete = Storage::disk('s3')->delete('uploads/8e1lBVQD6a45taG0osYGSwX5FBd51y9joPicM07T.rar');
    if($delete){
return response()->json([
        'message' => 'فایل با موفقیت حذف شد!',
    ]);
    }else{
        return response()->json([
        'message' => 'فایل با موفقیت حذف نشد!',
    ]);
    }
});

Route::get('/files/{fileId}/download', function (int $fileId) {
    
    // ساخت لینک موقت ۱ ساعته
    $url = Storage::disk('s3')->temporaryUrl('test-uploads/VfTpjh0DbzHTvjJMzajPjnBStlxSrByJ1BtYmjQR.jpg', now()->addHour());

    return response()->json([
        'url' => $url,
        'expires_at' => now()->addHour()->toIso8601String(),
    ]);
});
