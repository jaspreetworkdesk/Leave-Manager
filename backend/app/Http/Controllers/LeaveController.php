<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\LeaveBalance;
use App\Models\Leave;
use Carbon\Carbon;
use App\Http\Requests\StoreLeaveRequest;
use Illuminate\Support\Facades\DB;
use App\Mail\LeaveStatusMail;
use Illuminate\Support\Facades\Mail;

class LeaveController extends Controller
{
    public function approve($token)
    {
        $userData = [];

        return DB::transaction(function () use ($token) {

            $leave = Leave::with("user")->where('approval_token', $token)->firstOrFail();

            if ($leave->status !== 'pending') {
                return view('leave.action-result', [
                    'status'  => 'warning',
                    'title'   => 'Already Processed',
                    'message' => "This leave request has already been {$leave->status}.",
                    'leave'   => $leave,
                ]);
            }

            // Your balance update logic...

            $leave->update([
                'status' => 'approved',
                'approval_token' => null,
                'admin_remark' => 'Approved',
            ]);

            $userData["user_id"] = $leave->user->id;
            $userData["user_name"] = $leave->user->name;
            $userData["user_email"] = $leave->user->email;
          /*  echo "<pre>";
            print_r($userData);
            die("here");
           */
            Mail::to($leave->user->email)->send(
                new LeaveStatusMail($leave)
            );
        

            return view('leave.action-result', [
                'status'  => 'success',
                'title'   => 'Leave Approved',
                'message' => 'The leave request has been approved successfully.',
                'leave'   => $leave,$userData,
            ]);
        });
    }

    public function reject($token)
    {
        $leave = Leave::where('approval_token', $token)->firstOrFail();

        if ($leave->status !== 'pending') {
            return view('leave.action-result', [
                'status'  => 'warning',
                'title'   => 'Already Processed',
                'message' => "This leave request has already been {$leave->status}.",
                'leave'   => $leave,
            ]);
        }

        $leave->update([
            'status' => 'rejected',
            'approval_token' => null,
            'admin_remark' => 'Rejected',
        ]);

        Mail::to($leave->user->email)->send(
            new LeaveStatusMail($leave)
        );
        return view('leave.action-result', [
            'status'  => 'danger',
            'title'   => 'Leave Rejected',
            'message' => 'The leave request has been rejected.',
            'leave'   => $leave,
        ]);
    }
}
