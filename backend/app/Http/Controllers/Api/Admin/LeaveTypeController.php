<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveTypeController extends Controller
{
     public function index(Request $request)
    {
        $query = LeaveType::query()->latest();

        if ($request->filled('search')) {
            $search = strtolower($request->search);

            $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = (int) $request->input('per_page', 10);

        if ($perPage < 1) {
            $perPage = 10;
        }

        if ($perPage > 50) {
            $perPage = 50;
        }

        $leaveTypes = $query->paginate($perPage);

        return response()->json([
            'data' => $leaveTypes->items(),
            'meta' => [
                'current_page' => $leaveTypes->currentPage(),
                'last_page' => $leaveTypes->lastPage(),
                'per_page' => $leaveTypes->perPage(),
                'total' => $leaveTypes->total(),
            ],
        ]);
    }

    public function active()
    {
        $leaveTypes = LeaveType::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $leaveTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:leave_types,name'],
            'default_days' => ['required', 'numeric', 'min:0', 'max:365'],
            'is_active' => ['required', 'boolean'],
        ]);

        $leaveType = LeaveType::create($validated);

        return response()->json([
            'message' => 'Leave type created successfully.',
            'data' => $leaveType,
        ], 201);
    }

    public function show($id)
    {
        $leaveType = LeaveType::findOrFail($id);

        return response()->json($leaveType);
    }

    public function update(Request $request, $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('leave_types', 'name')->ignore($leaveType->id),
            ],
            'default_days' => ['required', 'numeric', 'min:0', 'max:365'],
            'is_active' => ['required', 'boolean'],
        ]);

        $isNameChanged = $leaveType->name !== $validated['name'];

        if ($isNameChanged) {
            $isUsedInLeaves = Leave::where('leave_type', $leaveType->name)->exists();

            $isUsedInBalances = LeaveBalance::where(
                'leave_type',
                $leaveType->name
            )->exists();

            if ($isUsedInLeaves || $isUsedInBalances) {
                return response()->json([
                    'message' => 'Leave type name cannot be changed because it is already used in leaves or leave balances.',
                    'errors' => [
                        'name' => [
                            'This leave type is already used. You can deactivate it instead of renaming it.',
                        ],
                    ],
                ], 422);
            }
        }

        $leaveType->update($validated);

        return response()->json([
            'message' => 'Leave type updated successfully.',
            'data' => $leaveType,
        ]);
    }

    public function destroy($id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $isUsedInLeaves = Leave::where('leave_type', $leaveType->name)->exists();

        $isUsedInBalances = LeaveBalance::where(
            'leave_type',
            $leaveType->name
        )->exists();

        if ($isUsedInLeaves || $isUsedInBalances) {
            return response()->json([
                'message' => 'This leave type cannot be deleted because it is already used. You can deactivate it instead.',
            ], 422);
        }

        $leaveType->delete();

        return response()->json([
            'message' => 'Leave type deleted successfully.',
        ]);
    }
}
