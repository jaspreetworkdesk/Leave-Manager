<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    protected $fillable = [
        'user_id',
        'leave_type',
        'year',
        'total_days',
        'used_days',
        'remaining_days',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
