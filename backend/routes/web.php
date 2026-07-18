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

    $applyLeaveData = [
        'leave_id'        => 101,
        'user_id'         => 1,
        'user_name'       => 'Jaspreet Singh',
        'user_email'      => 'jaspreetflashaiit@gmail.com',
        'leave_type'      => 'Annual Leave',
        'start_date'      => '2026-07-15',
        'end_date'        => '2026-07-18',
        'reason'          => 'I need to attend a family function and travel out of town. I kindly request approval for my leave.',
        'day_type'        => 'Full Day',
        'half_day_period' => null,
        'total_days'      => 4,
        'status'          => 'Pending',
        'approval_token'  => Str::random(64),
    ];
   /* Mail::to('jaspreet75820@gmail.com')->send(
        new ApplyLeaves($applyLeaveData)
    );
*/
    return 'Email sent successfully!';
}); 