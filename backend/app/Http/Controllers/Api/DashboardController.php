<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveBalance;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
public function adminStats(Request $request)
    {
        $year = $request->input('year', now()->year);

        $totalEmployees = Employee::count();
        $totalDepartments = Department::count();
        $totalDesignations = Designation::count();

        $totalLeaves = Leave::whereYear('start_date', $year)->count();

        $pendingLeaves = Leave::whereYear('start_date', $year)
            ->where('status', 'pending')
            ->count();

        $approvedLeaves = Leave::whereYear('start_date', $year)
            ->where('status', 'approved')
            ->count();

        $rejectedLeaves = Leave::whereYear('start_date', $year)
            ->where('status', 'rejected')
            ->count();

        $totalUsedLeaveDays = LeaveBalance::where('year', $year)
            ->sum('used_days');

        $negativeBalances = LeaveBalance::where('year', $year)
            ->where('remaining_days', '<', 0)
            ->count();

        $totalLeaveBalances = LeaveBalance::where('year', $year)->count();

        return response()->json([
            'year' => (int) $year,
            'total_employees' => $totalEmployees,
            'total_departments' => $totalDepartments,
            'total_designations' => $totalDesignations,
            'total_leaves' => $totalLeaves,
            'pending_leaves' => $pendingLeaves,
            'approved_leaves' => $approvedLeaves,
            'rejected_leaves' => $rejectedLeaves,
            'total_leave_balances' => $totalLeaveBalances,
            'total_used_leave_days' => (float) $totalUsedLeaveDays,
            'negative_balances' => $negativeBalances,
        ]);
    }

    public function employeeStats(Request $request)
    {
        $user = $request->user();
        $year = $request->input('year', now()->year);

        $myLeavesQuery = Leave::where('user_id', $user->id)
            ->whereYear('start_date', $year);

        $myTotalLeaves = (clone $myLeavesQuery)->count();

        $myPendingLeaves = (clone $myLeavesQuery)
            ->where('status', 'pending')
            ->count();

        $myApprovedLeaves = (clone $myLeavesQuery)
            ->where('status', 'approved')
            ->count();

        $myRejectedLeaves = (clone $myLeavesQuery)
            ->where('status', 'rejected')
            ->count();

        $myUsedLeaveDays = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->sum('used_days');

        $myRemainingLeaveDays = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->sum('remaining_days');

        $myNegativeBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', $year)
            ->where('remaining_days', '<', 0)
            ->count();

        return response()->json([
            'year' => (int) $year,
            'my_total_leaves' => $myTotalLeaves,
            'my_pending_leaves' => $myPendingLeaves,
            'my_approved_leaves' => $myApprovedLeaves,
            'my_rejected_leaves' => $myRejectedLeaves,
            'my_used_leave_days' => (float) $myUsedLeaveDays,
            'my_remaining_leave_days' => (float) $myRemainingLeaveDays,
            'my_negative_balances' => $myNegativeBalances,
        ]);
    }
}
