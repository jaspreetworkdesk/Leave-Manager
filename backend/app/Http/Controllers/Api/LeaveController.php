<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveBalance;
use App\Models\Leave;
use Carbon\Carbon;
use App\Http\Requests\StoreLeaveRequest;
use Illuminate\Support\Facades\DB;
use App\Mail\LeaveStatusMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Api\LeaveController;
use Illuminate\Support\Str;
use App\Mail\ApplyLeaves;


class LeaveController extends Controller
{


    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'day_type' => ['required', 'in:full_day,half_day'],
            'half_day_period' => ['nullable', 'required_if:day_type,half_day', 'in:first_half,second_half'],
        ]);

        if ($validated['day_type'] === 'half_day') {
            $validated['end_date'] = $validated['start_date'];
            $validated['total_days'] = 0.5;
        } else {
            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);

            $validated['half_day_period'] = null;
            $validated['total_days'] = $startDate->diffInDays($endDate) + 1;
        }
        $currentUser = $request->user();
        $applyLeaveData = [
            'user_id' => $request->user()->id,
            'leave_type' => $validated['leave_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'day_type' => $validated['day_type'],
            'half_day_period' => $validated['half_day_period'] ?? null,
            'total_days' => $validated['total_days'],
            'status' => 'pending',
            'approval_token'  => Str::random(64),
        ];

        $leave = Leave::create($applyLeaveData);
        if(!empty($leave)){
            $applyLeaveData["leave_id"] = $leave->id;
            $applyLeaveData["user_name"] = $currentUser->name;
            $applyLeaveData["user_email"] = $currentUser->email;
            Mail::to(env('ADMIN_EMAIL'))->send(
                new ApplyLeaves($applyLeaveData)
            );
        }    
        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave' => $leave,
        ], 201);
    }
    
    public function index(Request $request)
    {
        $leaves = Leave::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $leaves
        ]);
    }


    private function applyLeaveFilters($query, Request $request, bool $withUser = false)
    {
        if ($request->filled('search')) {
            $search = strtolower($request->search);

            $query->where(function ($q) use ($search, $withUser) {
                $q->whereRaw('LOWER(leave_type) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(reason) LIKE ?', ["%{$search}%"]);

                if ($withUser) {
                    $q->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                            ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
                    });
                }
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('leave_type')) {
            $query->where('leave_type', $request->leave_type);
        }

        if ($request->filled('day_type')) {
            $query->where('day_type', $request->day_type);
        }

        if ($request->filled('half_day_period')) {
            $query->where('half_day_period', $request->half_day_period);
        }

        if ($request->filled('month')) {
            $query->whereMonth('start_date', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('start_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('start_date', '<=', $request->to_date);
        }

        return $query;
    }

    private function leaveResponse($query, Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        if ($perPage < 1) {
            $perPage = 10;
        }

        if ($perPage > 50) {
            $perPage = 50;
        }

        $summaryQuery = clone $query;

        $summary = [
            'total' => (clone $summaryQuery)->count(),
            'pending' => (clone $summaryQuery)->where('status', 'pending')->count(),
            'approved' => (clone $summaryQuery)->where('status', 'approved')->count(),
            'rejected' => (clone $summaryQuery)->where('status', 'rejected')->count(),
            'total_days' => round((float) (clone $summaryQuery)->sum('total_days'), 1),
        ];

        $leaves = $query->paginate($perPage);

        return response()->json([
            'data' => $leaves->items(),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'per_page' => $leaves->perPage(),
                'total' => $leaves->total(),
            ],
            'summary' => $summary,
        ]);
    }

    public function myLeaves(Request $request)
    {
        $query = $request->user()
            ->leaves()
            ->latest();

        $query = $this->applyLeaveFilters($query, $request);

        return $this->leaveResponse($query, $request);
    }

public function allLeaves(Request $request)
{
    $query = Leave::with('user')->latest();

    if ($request->filled('search')) {
        $search = strtolower($request->search);

        $query->where(function ($q) use ($search) {
            $q->whereRaw('LOWER(leave_type) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(reason) LIKE ?', ["%{$search}%"])
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
                });
        });
    }

    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    if ($request->filled('leave_type')) {
        $query->where('leave_type', $request->leave_type);
    }

    if ($request->filled('day_type')) {
        $query->where('day_type', $request->day_type);
    }

    if ($request->filled('half_day_period')) {
        $query->where('half_day_period', $request->half_day_period);
    }

    if ($request->filled('month')) {
        $query->whereMonth('start_date', $request->month);
    }

    if ($request->filled('year')) {
        $query->whereYear('start_date', $request->year);
    }

    if ($request->filled('from_date')) {
        $query->whereDate('start_date', '>=', $request->from_date);
    }

    if ($request->filled('to_date')) {
        $query->whereDate('start_date', '<=', $request->to_date);
    }

    $summaryQuery = clone $query;

    $summary = [
        'total' => (clone $summaryQuery)->count(),
        'pending' => (clone $summaryQuery)->where('status', 'pending')->count(),
        'approved' => (clone $summaryQuery)->where('status', 'approved')->count(),
        'rejected' => (clone $summaryQuery)->where('status', 'rejected')->count(),
        'total_days' => (float) (clone $summaryQuery)->sum('total_days'),
    ];

    $perPage = (int) $request->input('per_page', 10);

    if ($perPage < 1) {
        $perPage = 10;
    }

    if ($perPage > 50) {
        $perPage = 50;
    }

    $leaves = $query->paginate($perPage);

    $leaveItems = collect($leaves->items())->map(function ($leave) {
        $leaveYear = Carbon::parse($leave->start_date)->year;

        $balance = LeaveBalance::where('user_id', $leave->user_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', $leaveYear)
            ->first();

        $leave->current_balance = $balance;

        return $leave;
    });

    return response()->json([
        'data' => $leaveItems,
        'meta' => [
            'current_page' => $leaves->currentPage(),
            'last_page' => $leaves->lastPage(),
            'per_page' => $leaves->perPage(),
            'total' => $leaves->total(),
        ],
        'summary' => $summary,
    ]);
}

    public function approve($id)
    {
        return DB::transaction(function () use ($id) {
            $leave = Leave::findOrFail($id);

            if ($leave->status !== 'pending') {
                return response()->json([
                    'message' => 'Only pending leave requests can be approved.',
                ], 422);
            }

            if (!$leave->total_days || $leave->total_days <= 0) {
                return response()->json([
                    'message' => 'Leave total days is missing or invalid.',
                ], 422);
            }

            $leaveYear = Carbon::parse($leave->start_date)->year;

            $leaveBalance = LeaveBalance::where('user_id', $leave->user_id)
                ->where('leave_type', $leave->leave_type)
                ->where('year', $leaveYear)
                ->lockForUpdate()
                ->first();

            if (!$leaveBalance) {
                $leaveBalance = LeaveBalance::create([
                    'user_id' => $leave->user_id,
                    'leave_type' => $leave->leave_type,
                    'year' => $leaveYear,
                    'total_days' => 0,
                    'used_days' => 0,
                    'remaining_days' => 0,
                ]);
            }

            $newUsedDays = (float) $leaveBalance->used_days + (float) $leave->total_days;
            $newRemainingDays = (float) $leaveBalance->remaining_days - (float) $leave->total_days;

            $leaveBalance->update([
                'used_days' => $newUsedDays,
                'remaining_days' => $newRemainingDays,
            ]);

            $leave->update([
                'status' => 'approved',
                'admin_remark' => $newRemainingDays < 0
                    ? 'Approved with negative leave balance'
                    : 'Approved',
            ]);

            Mail::to($leave->user->email)->send(
                new LeaveStatusMail($leave)
            );
            return response()->json([
                'message' => $newRemainingDays < 0
                    ? 'Leave approved successfully. Employee balance is now negative.'
                    : 'Leave approved successfully.',
                'leave' => $leave,
                'balance' => $leaveBalance,
                'balance_warning' => $newRemainingDays < 0,
            ]);
        });
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_remark' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $leave = Leave::findOrFail($id);

        if ($leave->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending leave requests can be rejected.',
            ], 422);
        }

        $leave->update([
            'status' => 'rejected',
            'admin_remark' => $validated['admin_remark'],
        ]);

        Mail::to($leave->user->email)->send(
            new LeaveStatusMail($leave)
        );
        return response()->json([
            'message' => 'Leave rejected successfully.',
            'leave' => $leave,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $leaves = $user->leaves;

        return response()->json([
            'total' => $leaves->count(),
            'pending' => $leaves->where('status', 'pending')->count(),
            'approved' => $leaves->where('status', 'approved')->count(),
            'rejected' => $leaves->where('status', 'rejected')->count(),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $leave = Leave::findOrFail($id);

        $leave->status = $request->status;

        $leave->save();

        return response()->json([
            'status' => true,
            'message' => 'Status updated'
        ]);
    }

    public function myLeaveBalances(Request $request)
    {
        $year = $request->input('year', now()->year);

        $balances = LeaveBalance::where('user_id', $request->user()->id)
            ->where('year', $year)
            ->orderBy('leave_type')
            ->get();

        return response()->json([
            'data' => $balances,
        ]);
    }
}
