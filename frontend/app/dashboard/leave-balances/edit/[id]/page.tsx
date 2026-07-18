"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  getLeaveBalance,
  updateLeaveBalance,
} from "@/services/leaveBalanceService";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";

type User = {
  id: number;
  name: string;
  email: string;
};

type LeaveBalance = {
  id: number;
  user_id: number;
  leave_type: string;
  year: number;
  total_days: string | number;
  used_days: string | number;
  remaining_days: string | number;
  user?: User | null;
};

type FormErrors = {
  total_days?: string;
};

export default function EditLeaveBalancePage() {
  const router = useRouter();
  const params = useParams();

  const balanceId = params.id as string;

  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [totalDays, setTotalDays] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const fetchLeaveBalance = async () => {
    try {
      setPageLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getLeaveBalance(balanceId);

      console.log("Leave balance response:", response.data);

      const balance = response.data.data || response.data;

      setLeaveBalance(balance);
      setTotalDays(String(balance.total_days || ""));
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (error.response?.status === 404) {
        Swal.fire("Not found", "Leave balance not found.", "error");
        router.push("/dashboard/leave-balances");
        return;
      }

      Swal.fire("Error", "Failed to load leave balance.", "error");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveBalance();
  }, [balanceId]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!totalDays) {
      newErrors.total_days = "Total days is required.";
    } else if (Number(totalDays) < 0) {
      newErrors.total_days = "Total days cannot be negative.";
    } else if (Number(totalDays) > 365) {
      newErrors.total_days = "Total days cannot be more than 365.";
    } else if (
      leaveBalance &&
      Number(totalDays) < Number(leaveBalance.used_days || 0)
    ) {
      newErrors.total_days =
        "Total days cannot be less than already used days.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitLoading(true);
      setErrors({});

      await updateLeaveBalance(balanceId, {
        total_days: totalDays,
      });

      Swal.fire("Success", "Leave balance updated successfully.", "success");

      router.push("/dashboard/leave-balances");
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
          total_days: backendErrors?.total_days?.[0],
        });

        Swal.fire(
          "Validation error",
          error.response.data.message || "Please check the total days.",
          "error"
        );

        return;
      }

      Swal.fire("Error", "Failed to update leave balance.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return <p className="p-6">Loading leave balance...</p>;
  }

  if (!leaveBalance) {
    return <p className="p-6">Leave balance not found.</p>;
  }

  const calculatedRemainingDays =
    Number(totalDays || 0) - Number(leaveBalance.used_days || 0);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Leave Balance</h1>
        <p className="text-gray-500">
          Update total allowed leave days for this employee.
        </p>
      </div>

      <div className="border rounded p-6 space-y-3 bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">Employee</p>
          <p className="font-medium">
            {leaveBalance.user?.name || "-"}{" "}
            <span className="text-gray-500">
              {leaveBalance.user?.email ? `(${leaveBalance.user.email})` : ""}
            </span>
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Leave Type</p>
          <p className="font-medium">{leaveBalance.leave_type}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Year</p>
          <p className="font-medium">{leaveBalance.year}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
          <div className="border rounded p-4 bg-white">
            <p className="text-sm text-gray-500">Current Total</p>
            <p className="text-xl font-bold">{leaveBalance.total_days}</p>
          </div>

          <div className="border rounded p-4 bg-white">
            <p className="text-sm text-gray-500">Used Days</p>
            <p className="text-xl font-bold">{leaveBalance.used_days}</p>
          </div>

          <div className="border rounded p-4 bg-white">
            <p className="text-sm text-gray-500">Current Remaining</p>
            <p className="text-xl font-bold">{leaveBalance.remaining_days}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="border rounded p-6 space-y-5">
        <FormInput
          label="New Total Days"
          type="number"
          value={totalDays}
          placeholder="Example: 10"
          error={errors.total_days}
          onChange={setTotalDays}
        />

        <div className="border rounded p-4 bg-gray-50">
          <p className="text-sm text-gray-500">New Remaining Days Preview</p>
          <p className="text-2xl font-bold">
            {calculatedRemainingDays >= 0 ? calculatedRemainingDays : 0}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={submitLoading}>
            Update Leave Balance
          </Button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/leave-balances")}
            className="bg-gray-200 px-5 py-3 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}