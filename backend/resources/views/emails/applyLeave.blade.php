<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Leave Application</title>

    <style>
        body{
            margin:0;
            padding:0;
            background:#f4f6f9;
            font-family:Arial,Helvetica,sans-serif;
        }

        .container{
            max-width:650px;
            margin:30px auto;
            background:#ffffff;
            border-radius:8px;
            overflow:hidden;
            border:1px solid #e5e5e5;
        }

        .header{
            background:#0d6efd;
            color:#fff;
            padding:20px;
            text-align:center;
        }

        .content{
            padding:30px;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        table td{
            padding:12px;
            border:1px solid #ddd;
        }

        table td:first-child{
            width:180px;
            font-weight:bold;
            background:#f8f9fa;
        }

        .reason{
            background:#f8f9fa;
            padding:15px;
            border-radius:5px;
            margin-top:15px;
        }

        .buttons{
            text-align:center;
            margin-top:35px;
        }

        .btn{
            text-decoration:none;
            padding:12px 30px;
            border-radius:5px;
            color:#fff !important;
            font-weight:bold;
            display:inline-block;
            margin:0 8px;
        }

        .approve{
            background:#28a745;
        }

        .reject{
            background:#dc3545;
        }

        .footer{
            padding:20px;
            text-align:center;
            color:#666;
            font-size:13px;
            background:#fafafa;
        }
    </style>

</head>

<body>

<div class="container">

    <div class="header">
        <h2>New Leave Request</h2>
    </div>

    <div class="content">

        <p>Hello Admin,</p>

        <p>A new leave request has been submitted.</p>

        <table>

            <tr>
                <td>Employee Name</td>
                <td>{{ $mailData['user_name'] }}</td>
            </tr>

            <tr>
                <td>Email</td>
                <td>{{ $mailData['user_email'] }}</td>
            </tr>

            <tr>
                <td>Leave Type</td>
                <td>{{ ucfirst($mailData['leave_type']) }}</td>
            </tr>

            <tr>
                <td>Start Date</td>
                <td>{{ \Carbon\Carbon::parse($mailData['start_date'])->format('d M Y') }}</td>
            </tr>

            <tr>
                <td>End Date</td>
                <td>{{ \Carbon\Carbon::parse($mailData['end_date'])->format('d M Y') }}</td>
            </tr>

            <tr>
                <td>Day Type</td>
                <td>{{ ucfirst(str_replace('_',' ', $mailData['day_type'])) }}</td>
            </tr>

            @if(!empty($mailData['half_day_period']))
            <tr>
                <td>Half Day Period</td>
                <td>{{ ucfirst($mailData['half_day_period']) }}</td>
            </tr>
            @endif

            <tr>
                <td>Total Days</td>
                <td>{{ $mailData['total_days'] }}</td>
            </tr>

            <tr>
                <td>Status</td>
                <td><strong>{{ ucfirst($mailData['status']) }}</strong></td>
            </tr>

        </table>

        <h3>Reason</h3>

        <div class="reason">
            {{ $mailData['reason'] }}
        </div>

        <div class="buttons">

            <a href="{{ url('/leave/approve/'.$mailData['approval_token']) }}"
               class="btn approve">
                ✓ Approve
            </a>

            <a href="{{ url('/leave/reject/'.$mailData['approval_token']) }}"
               class="btn reject">
                ✕ Reject
            </a>

        </div>

    </div>

    <div class="footer">
        This email was generated automatically by the Leave Management System.
    </div>

</div>

</body>
</html>