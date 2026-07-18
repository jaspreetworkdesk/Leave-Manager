<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Department;
use App\Models\Designation;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'employee_code',
        'phone',
        'department_id',
        'designation_id',
        'joining_date',
        'salary',
        'address',
    ];

// app/Models/Employee.php

public function user()
{
    return $this->belongsTo(User::class);
}

public function department()
{
    return $this->belongsTo(Department::class, 'department_id');
}

public function designation()
{
    return $this->belongsTo(Designation::class, 'designation_id');
}

}
