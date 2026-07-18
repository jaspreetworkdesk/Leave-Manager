<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\Admin\DepartmentController;
use App\Http\Controllers\Api\Admin\DesignationController;
use App\Http\Controllers\Api\Admin\LeaveBalanceController;
use App\Http\Controllers\Api\Admin\LeaveTypeController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel 13 API working'
    ]);
});

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);

});

Route::post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/stats', [DashboardController::class, 'employeeStats']);

    Route::get('/me', function (Request $request) {

        return response()->json([
            'status' => true,
            'user' => $request->user()
        ]);

    });
    
    Route::get('/user-detail', [AuthController::class, 'userDetail']);
    Route::patch('/update-user-detail', [AuthController::class, 'updateUserDetail']);
    
    Route::get('/dashboard-stats', [LeaveController::class, 'dashboard']);
    

    Route::get('/my-leaves', [LeaveController::class, 'myLeaves']);
    Route::get('/my-leave-balances', [LeaveController::class, 'myLeaveBalances']);
    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);  

    Route::get('/leave-types/active', [LeaveTypeController::class, 'active']);
    
});


Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    Route::get('/admin/dashboard/stats', [DashboardController::class, 'adminStats']);


    Route::get('/admin/leaves', [LeaveController::class, 'allLeaves']);
    Route::patch('/admin/leaves/{id}/approve', [LeaveController::class, 'approve']);
    Route::patch('/admin/leaves/{id}/reject', [LeaveController::class, 'reject']);

  

    Route::get('/admin/employees',[EmployeeController::class, 'index']);
    Route::post('/admin/employees',[EmployeeController::class, 'store']);
    Route::get('/admin/employees/{id}', [EmployeeController::class, 'show']);
    Route::patch('/admin/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/admin/employees/{id}',[EmployeeController::class, 'destroy']);

    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::patch('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

    Route::get('/designations', [DesignationController::class, 'index']);
    Route::post('/designations', [DesignationController::class, 'store']);
    Route::get('/designations/{id}', [DesignationController::class, 'show']);
    Route::patch('/designations/{id}', [DesignationController::class, 'update']);
    Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);


    Route::get('/admin/leave-balances', [LeaveBalanceController::class, 'index']);
    Route::post('/admin/leave-balances', [LeaveBalanceController::class, 'store']);
    Route::get('/admin/leave-balances/{id}', [LeaveBalanceController::class, 'show']);
    Route::patch('/admin/leave-balances/{id}', [LeaveBalanceController::class, 'update']);
    Route::delete('/admin/leave-balances/{id}', [LeaveBalanceController::class, 'destroy']);

    Route::get('/admin/leave-types', [LeaveTypeController::class, 'index']);
    Route::post('/admin/leave-types', [LeaveTypeController::class, 'store']);
    Route::get('/admin/leave-types/{id}', [LeaveTypeController::class, 'show']);
    Route::patch('/admin/leave-types/{id}', [LeaveTypeController::class, 'update']);
    Route::delete('/admin/leave-types/{id}', [LeaveTypeController::class, 'destroy']);
    
});
