<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\Employee;
use App\Models\Designation;
use App\Models\Department;
use App\Models\User;
use Illuminate\Support\Facades\DB;

use Illuminate\Validation\Rule;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Throwable;


class AuthController extends Controller
{
public function register(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:6',
    ]);

    // Check existing email
    $existingUser = User::where('email', $request->email)->first();

    if ($existingUser) {

        return response()->json([
            'status' => false,
            'message' => 'Email already exists'
        ], 409);
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'employee'
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'status' => true,
        'message' => 'User registered successfully',
        'token' => $token,
        'user' => $user
    ]);
}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {

            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }


    public function userDetail(Request $request)
    {
        $user = Auth::user();

        $employee = Employee::with(['user', 'department', 'designation'])
            ->where('user_id', Auth::id())
            ->first();

        return response()->json([
            'message'  => 'Employee updated successfully',
            'employee' => $employee,
        ]);

    }

    public function updateUserDetail(Request $request)
    {
        $user = Auth::user();

        $employee = Employee::with(['user', 'department', 'designation'])
            ->where('user_id', Auth::id())
            ->first();
 
        $formInputs = [
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($employee->user_id),
            ],
        ];
        if(!empty($request->password)){
            $formInputs['password'] = ['required', 'string', 'min:8', 'confirmed'];        
        }
        $validated = $request->validate($formInputs);
        
        DB::transaction(function () use ($validated, $employee) {
            $userData= [
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ];
            if(!empty($validated['password'])){
                $userData['password'] = Hash::make($validated['password']);
            }
            $employee->user->update($userData);
            $employeeData = [];
            /*$employeeData = [
                'employee_code' => $validated['employee_code'],
                'phone'         => $validated['phone'] ?? null,
                'department'    => $validated['department_id'],
                'designation'   => $validated['designation_id'],
                'joining_date'  => $validated['joining_date'] ?? null,
                'salary'        => $validated['salary'] ?? null,
                'address'       => $validated['address'] ?? null,
            ];
            */
           
            $employee->update($employeeData);
        });

        return response()->json([
            'message'  => 'User Profile updated successfully',
            'employee' => $employee->fresh()->load('user'),
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully'
        ]);
    }

     /**
     * API 1: Send password reset link.
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $status = PasswordBroker::broker('users')->sendResetLink([
                'email' => $validated['email'],
            ]);

            if ($status === PasswordBroker::ResetLinkSent) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password reset link sent successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => __($status),
                'status_code' => $status,
            ], 422);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * API 2: Reset password.
     */
   public function resetPassword(Request $request)
{
    $validated = $request->validate([
        'token' => ['required', 'string'],
        'email' => ['required', 'email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $status = PasswordBroker::reset(
        [
            'email' => $validated['email'],
            'password' => $validated['password'],
            'password_confirmation' => $request->password_confirmation,
            'token' => $validated['token'],
        ],
        function (User $user, string $password): void {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->setRememberToken(Str::random(60));

            $user->save();

            // Revoke all existing Sanctum tokens.
            $user->tokens()->delete();

            event(new PasswordReset($user));
        }
    );

    if ($status !== PasswordBroker::PasswordReset) {
        return response()->json([
            'success' => false,
            'message' => __($status),
        ], 422);
    }

    return response()->json([
        'success' => true,
        'message' => 'Password reset successfully. Please log in again.',
    ]);
}
}
