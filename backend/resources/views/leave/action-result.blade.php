<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>

    <style>
        body{
            margin:0;
            background:#f4f6f9;
            font-family:Arial, Helvetica, sans-serif;
        }

        .card{
            max-width:600px;
            margin:80px auto;
            background:#fff;
            border-radius:8px;
            padding:40px;
            text-align:center;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
        }

        .icon{
            font-size:70px;
            margin-bottom:20px;
        }

        .success{color:#28a745;}
        .danger{color:#dc3545;}
        .warning{color:#f39c12;}

        table{
            width:100%;
            margin-top:30px;
            border-collapse:collapse;
        }

        td{
            padding:12px;
            border:1px solid #eee;
            text-align:left;
        }

        td:first-child{
            font-weight:bold;
            width:180px;
            background:#f8f9fa;
        }
    </style>
</head>
<body>

<div class="card">

    <div class="icon {{ $status }}">
        @if($status == 'success')
            ✅
        @elseif($status == 'danger')
            ❌
        @else
            ⚠️
        @endif
    </div>

    <h2 class="{{ $status }}">{{ $title }}</h2>

    <p>{{ $message }}</p>

<table class="table">

    <tr>
        <th>Employee Name</th>
        <td>{{ $leave->user->name }}</td>
    </tr>

    <tr>
        <th>Email</th>
        <td>{{ $leave->user->email }}</td>
    </tr>

    <tr>
        <th>Leave Type</th>
        <td>{{ $leave->leave_type }}</td>
    </tr>

    <tr>
        <th>Start Date</th>
        <td>{{ \Carbon\Carbon::parse($leave->start_date)->format('d M Y') }}</td>
    </tr>

    <tr>
        <th>End Date</th>
        <td>{{ \Carbon\Carbon::parse($leave->end_date)->format('d M Y') }}</td>
    </tr>

    <tr>
        <th>Day Type</th>
        <td>{{ $leave->day_type }}</td>
    </tr>

    @if($leave->half_day_period)
    <tr>
        <th>Half Day Period</th>
        <td>{{ $leave->half_day_period }}</td>
    </tr>
    @endif

    <tr>
        <th>Total Days</th>
        <td>{{ $leave->total_days }}</td>
    </tr>

    <tr>
        <th>Reason</th>
        <td>{{ $leave->reason }}</td>
    </tr>

    <tr>
        <th>Status</th>
        <td>
            <strong>{{ ucfirst($leave->status) }}</strong>
        </td>
    </tr>

    <tr>
        <th>Admin Remark</th>
        <td>{{ $leave->admin_remark }}</td>
    </tr>

    <tr>
        <th>Applied On</th>
        <td>{{ $leave->created_at->format('d M Y h:i A') }}</td>
    </tr>

    <tr>
        <th>Processed On</th>
        <td>{{ $leave->updated_at->format('d M Y h:i A') }}</td>
    </tr>

</table>

</div>

</body>
</html>