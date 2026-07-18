<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveBalanceController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveBalance::with('user')->latest();

        if ($request->filled('search')) {
            $search = strtolower($request->search);

            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(leave_type) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                            ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
                    });
            });
        }

        if ($request->filled('leave_type')) {
            $query->where('leave_type', $request->leave_type);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $balances = $query->paginate(10);

        return response()->json([
            'data' => $balances->items(),
            'meta' => [
                'current_page' => $balances->currentPage(),
                'last_page' => $balances->lastPage(),
                'per_page' => $balances->perPage(),
                'total' => $balances->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'leave_type' => ['required', 'string', 'max:100'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'total_days' => ['required', 'numeric', 'min:0', 'max:365'],
        ]);

        $leaveBalance = LeaveBalance::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'leave_type' => $validated['leave_type'],
                'year' => $validated['year'],
            ],
            [
                'total_days' => $validated['total_days'],
                'used_days' => 0,
                'remaining_days' => $validated['total_days'],
            ]
        );

        return response()->json([
            'message' => 'Leave balance saved successfully',
            'data' => $leaveBalance->load('user'),
        ], 201);
    }

    public function show($id)
    {
        $leaveBalance = LeaveBalance::with('user')->findOrFail($id);

        return response()->json($leaveBalance);
    }

    public function update(Request $request, $id)
    {
        $leaveBalance = LeaveBalance::findOrFail($id);

        $validated = $request->validate([
            'total_days' => ['required', 'numeric', 'min:0', 'max:365'],
        ]);

        $usedDays = $leaveBalance->used_days;
        $remainingDays = $validated['total_days'] - $usedDays;

        if ($remainingDays < 0) {
            return response()->json([
                'message' => 'Total days cannot be less than already used days.',
                'errors' => [
                    'total_days' => [
                        'Total days cannot be less than used days.',
                    ],
                ],
            ], 422);
        }

        $leaveBalance->update([
            'total_days' => $validated['total_days'],
            'remaining_days' => $remainingDays,
        ]);

        return response()->json([
            'message' => 'Leave balance updated successfully',
            'data' => $leaveBalance->load('user'),
        ]);
    }

    public function destroy($id)
    {
        $leaveBalance = LeaveBalance::findOrFail($id);

        if ($leaveBalance->used_days > 0) {
            return response()->json([
                'message' => 'This balance cannot be deleted because leave days are already used.',
            ], 422);
        }

        $leaveBalance->delete();

        return response()->json([
            'message' => 'Leave balance deleted successfully',
        ]);
    }
}