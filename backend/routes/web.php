<?php

use Illuminate\Support\Facades\Route;
use App\Mail\ApplyLeaves;
use App\Mail\LeaveStatusMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\LeaveController;
use Illuminate\Support\Str;


Route::get('/leave/approve/{id}', [LeaveController::class, 'approve']);
Route::get('/leave/reject/{id}', [LeaveController::class, 'reject']);

Route::get('/', function () {
    return response()->json([
        'status' => true,
        'message' => 'Leave Manager API is running',
    ]);
});