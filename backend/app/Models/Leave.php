<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
protected $fillable = [
    'user_id',
    'leave_type',
    'start_date',
    'end_date',
    'reason',
    'day_type',
    'half_day_period',
    'total_days',
    'status',
    'admin_remark',
    'approval_token',
];

protected $casts = [
    'total_days' => 'float',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
