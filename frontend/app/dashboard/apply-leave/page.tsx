"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { applyLeave, getMyLeaveBalances } from "@/services/leaveService";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import Button from "@/components/ui/Button";

type FormErrors = {
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  day_type?: string;
  half_day_period?: string;
};

type LeaveBalance = {
  id: number;
  leave_type: string;
  year: number;
  total_days: string | number;
  used_days: string | number;
  remaining_days: string | number;
};

export default function ApplyLeavePage() {
  const router = useRouter();

  const [leaveType, setLeaveType] = useState("");
  const [dayType, setDayType] = useState("full_day");
  const [halfDayPeriod, setHalfDayPeriod] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setSubmitLoading] = useState(false);

  const fetchMyLeaveBalances = async () => {
    try {
      setBalanceLoading(true);

      const currentYear = new Date().getFullYear();

      const response = await getMyLeaveBalances(currentYear);

      console.log("My leave balances:", response.data);

      const responseData = response.data;

      if (Array.isArray(responseData)) {
        setLeaveBalances(responseData);
      } else if (Array.isArray(responseData.data)) {
        setLeaveBalances(responseData.data);
      } else {
        setLeaveBalances([]);
      }
    } catch (error) {
      console.log(error);
      setLeaveBalances([]);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaveBalances();
  }, []);

  useEffect(() => {
    if (dayType === "half_day" && startDate) {
      setEndDate(startDate);
    }

    if (dayType === "full_day") {
      setHalfDayPeriod("");
    }
  }, [dayType, startDate]);

  const totalDays = useMemo(() => {
    if (dayType === "half_day") {
      return 0.5;
    }

    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return 0;
    }

    const difference = end.getTime() - start.getTime();
    const days = difference / (1000 * 60 * 60 * 24);

    return days + 1;
  }, [dayType, startDate, endDate]);

  const selectedBalance = leaveBalances.find(
    (balance) => balance.leave_type === leaveType
  );

  const remainingDays = Number(selectedBalance?.remaining_days || 0);

  const isOverBalance =
    Boolean(selectedBalance) && totalDays > remainingDays;

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!leaveType) {
      newErrors.leave_type = "Leave type is required.";
    }

    if (!dayType) {
      newErrors.day_type = "Leave day type is required.";
    }

    if (dayType === "half_day" && !halfDayPeriod) {
      newErrors.half_day_period = "Half day period is required.";
    }

    if (!startDate) {
      newErrors.start_date = "Start date is required.";
    }

    if (!endDate) {
      newErrors.end_date = "End date is required.";
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.end_date = "End date cannot be before start date.";
    }

    if (
      dayType === "half_day" &&
      startDate &&
      endDate &&
      startDate !== endDate
    ) {
      newErrors.end_date =
        "For half day leave, start date and end date must be the same.";
    }

    if (!reason.trim()) {
      newErrors.reason = "Reason is required.";
    } else if (reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitLoading(true);
      setErrors({});

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Login required", "Please login again.", "error");
        router.push("/login");
        return;
      }

      const data = {
        leave_type: leaveType,
        start_date: startDate,
        end_date: dayType === "half_day" ? startDate : endDate,
        reason: reason.trim(),
        day_type: dayType,
        half_day_period: dayType === "half_day" ? halfDayPeriod : null,
      };

      await applyLeave(data);

      Swal.fire("Success", "Leave request submitted successfully.", "success");

      router.push("/dashboard/my-leaves");
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;

        setErrors({
          leave_type: backendErrors?.leave_type?.[0],
          start_date: backendErrors?.start_date?.[0],
          end_date: backendErrors?.end_date?.[0],
          reason: backendErrors?.reason?.[0],
          day_type: backendErrors?.day_type?.[0],
          half_day_period: backendErrors?.half_day_period?.[0],
        });

        Swal.fire(
          "Validation error",
          error.response.data.message || "Please check the form fields.",
          "error"
        );

        return;
      }

      Swal.fire("Error", "Failed to submit leave request.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Apply Leave</h1>
        <p className="text-gray-500">
          Submit a leave request for admin approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card space-y-6 border p-6 rounded">
        <FormSelect
          label="Leave Type"
          value={leaveType}
          error={errors.leave_type}
          onChange={setLeaveType}
          options={[
            { label: "Select leave type", value: "" },
            { label: "Sick Leave", value: "Sick Leave" },
            { label: "Casual Leave", value: "Casual Leave" },
            { label: "Annual Leave", value: "Annual Leave" },
            { label: "Emergency Leave", value: "Emergency Leave" },
            { label: "Unpaid Leave", value: "Unpaid Leave" },
          ]}
        />

        <FormSelect
          label="Leave Day Type"
          value={dayType}
          error={errors.day_type}
          onChange={setDayType}
          options={[
            { label: "Full Day", value: "full_day" },
            { label: "Half Day", value: "half_day" },
          ]}
        />

        {dayType === "half_day" && (
          <FormSelect
            label="Half Day Period"
            value={halfDayPeriod}
            error={errors.half_day_period}
            onChange={setHalfDayPeriod}
            options={[
              { label: "Select half", value: "" },
              { label: "First Half", value: "first_half" },
              { label: "Second Half", value: "second_half" },
            ]}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label={dayType === "half_day" ? "Leave Date" : "Start Date"}
            type="date"
            value={startDate}
            error={errors.start_date}
            onChange={setStartDate}
          />

          <FormInput
            label="End Date"
            type="date"
            value={endDate}
            error={errors.end_date}
            onChange={setEndDate}
          />
        </div>

        {dayType === "half_day" && (
          <p className="text-sm text-gray-500">
            For half day leave, end date will be the same as leave date.
          </p>
        )}

        <div className="border p-4 rounded bg-gray-50">
          <p className="font-medium">Total Leave Days</p>
          <p className="text-2xl font-bold">{totalDays}</p>
        </div>

        {leaveType && (
          <div className="border p-4 rounded bg-gray-50 space-y-3">
            <p className="font-medium">Leave Balance</p>

            {balanceLoading ? (
              <p className="text-sm text-gray-500">Checking balance...</p>
            ) : selectedBalance ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold">{selectedBalance.total_days}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Used</p>
                  <p className="font-bold">{selectedBalance.used_days}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p
                    className={
                      Number(selectedBalance.remaining_days) < 0
                        ? "font-bold text-red-600"
                        : "font-bold text-green-700"
                    }
                  >
                    {selectedBalance.remaining_days}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-orange-600">
                No leave balance found for this leave type. Admin can still
                review and approve your request if needed.
              </p>
            )}

            {isOverBalance && (
              <div className="bg-orange-100 text-orange-700 p-3 rounded text-sm">
                Requested leave days are more than your available balance. You
                can still submit the request, and admin will decide.
              </div>
            )}
          </div>
        )}

        <FormTextarea
          label="Reason"
          value={reason}
          placeholder="Write the reason for your leave request"
          error={errors.reason}
          onChange={setReason}
        />

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Submit Leave Request
          </Button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/my-leaves")}
            className="bg-gray-200 px-5 py-3 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}