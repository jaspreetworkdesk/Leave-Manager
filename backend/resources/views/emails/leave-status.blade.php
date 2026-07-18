<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

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
    background:#fff;
    border-radius:8px;
    overflow:hidden;
}

.header{
    padding:30px;
    color:#fff;
    text-align:center;
}

.approved{
    background:#198754;
}

.rejected{
    background:#dc3545;
}

.content{
    padding:30px;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

td{
    border:1px solid #ddd;
    padding:12px;
}

td:first-child{
    font-weight:bold;
    background:#fafafa;
    width:180px;
}

.footer{
    padding:25px;
    text-align:center;
    color:#777;
    font-size:13px;
}

</style>

</head>

<body>

<div class="container">
<?php

$leave = $mailData;

?>
<div class="header {{ $leave->status == 'approved' ? 'approved' : 'rejected' }}">

<h2>

@if($leave->status=='approved')

✅ Leave Approved

@else

❌ Leave Rejected

@endif

</h2>

</div>

<div class="content">

<p>Hello <strong>{{ $leave->user->name }}</strong>,</p>

<p>

Your leave request has been

<strong>{{ ucfirst($leave->status) }}</strong>.

</p>

<table>

<tr>
<td>Leave Type</td>
<td>{{ $leave->leave_type }}</td>
</tr>

<tr>
<td>Duration</td>
<td>{{ \Carbon\Carbon::parse($leave->start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($leave->end_date)->format('d M Y') }}</td>
</tr>

<tr>
<td>Total Days</td>
<td>{{ $leave->total_days }}</td>
</tr>

<tr>
<td>Status</td>
<td>{{ ucfirst($leave->status) }}</td>
</tr>

<tr>
<td>Admin Remark</td>
<td>{{ $leave->admin_remark ?: '-' }}</td>
</tr>

</table>

@if($leave->status=='approved')

<p style="margin-top:25px">
We hope you have a pleasant break. Please ensure your responsibilities are handed over before your leave begins.
</p>

@else

<p style="margin-top:25px">
Unfortunately, your leave request could not be approved. If you have any questions, please contact your manager or the HR department.
</p>

@endif

</div>

<div class="footer">

This is an automated email from the Leave Management System.<br>

Please do not reply to this email.

</div>

</div>

</body>

</html>