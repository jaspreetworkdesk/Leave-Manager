<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = [
        'name',
        'default_days',
        'is_active',
    ];

    protected $casts = [
        'default_days' => 'decimal:1',
        'is_active' => 'boolean',
    ];
}
