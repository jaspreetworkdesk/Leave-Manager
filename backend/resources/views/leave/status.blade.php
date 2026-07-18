<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Leave Request Status</title>

    <style>
        body{
            margin:0;
            padding:40px 0;
            background:#f4f6f9;
            font-family:Arial,Helvetica,sans-serif;
        }

        .container{
            width:700px;
            margin:auto;
            background:#fff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,.08);
        }

        .header{
            padding:30px;
            text-align:center;
            color:#fff;
        }

        .approved{
            background:#198754;
        }

        .rejected{
            background:#dc3545;
        }

        .content{
            padding:35px;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:25px;
        }

        table td{
            border:1px solid #e5e5e5;
            padding:12px;
        }

        table td:first-child{
            width:220px;
            font-weight:bold;
            background:#fafafa;
        }

        .footer{
            text-align:center;
            color:#777;
            padding:25px;
            font-size:13px;
        }
    </style>

</head>

<body>

<div class="container">

    <div class="header {{ $leave->status == 'approved' ? 'approved' : 'rejected' }}">

        <h1>
            {{ $leave->status == 'approved' ? '✅ Leave Approved' : '❌ Leave Rejected' }}
        </h1>

        <p>
            This leave request has been
            <strong>{{ ucfirst($leave->status) }}</strong>.
        </p>

    </div>

    <div class="content">

        <table>

            <tr>
                <td>Employee Name</td>
                <td>{{ $leave->user_name }}</td>
            </tr>

            <tr>
                <td>Email</td>
                <td>{{ $leave->user_email }}</td>
            </tr>

            <tr>
                <td>Leave Type</td>
                <td>{{ $leave->leave_type }}</td>
            </tr>

            <tr>
                <td>Start Date</td>
                <td>{{ \Carbon\Carbon::parse($leave->start_date)->format('d M Y') }}</td>
            </tr>

            <tr>
                <td>End Date</td>
                <td>{{ \Carbon\Carbon::parse($leave->end_date)->format('d M Y') }}</td>
            </tr>

            <tr>
                <td>Total Days</td>
                <td>{{ $leave->total_days }}</td>
            </tr>

            <tr>
                <td>Day Type</td>
                <td>{{ $leave->day_type }}</td>
            </tr>

            @if($leave->half_day_period)
            <tr>
                <td>Half Day Period</td>
                <td>{{ $leave->half_day_period }}</td>
            </tr>
            @endif

            <tr>
                <td>Reason</td>
                <td>{{ $leave->reason }}</td>
            </tr>

            <tr>
                <td>Status</td>
                <td><strong>{{ ucfirst($leave->status) }}</strong></td>
            </tr>

            <tr>
                <td>Admin Remark</td>
                <td>{{ $leave->admin_remark ?: '-' }}</td>
            </tr>

            <tr>
                <td>Processed On</td>
                <td>{{ $leave->updated_at->format('d M Y h:i A') }}</td>
            </tr>

        </table>

    </div>

    <div class="footer">
        Leave Management System
    </div>

</div>

</body>
</html>