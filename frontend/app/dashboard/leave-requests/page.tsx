"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  getLeaveRequests,
  approveLeave,
  rejectLeave,
} from "@/services/leaveService";
import { getActiveLeaveTypes } from "@/services/leaveTypeService";
import usePagination, {
  emptyPaginationMeta,
} from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

type User = {
  id: number;
  name: string;
  email: string;
};

type CurrentBalance = {
  id: number;
  total_days: string | number;
  used_days: string | number;
  remaining_days: string | number;
} | null;

type Leave = {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  day_type?: string;
  half_day_period?: string | null;
  total_days?: string | number;
  status: string;
  admin_remark?: string | null;
  created_at?: string;
  user?: User | null;
  current_balance?: CurrentBalance;
};

type LeaveType = {
  id: number;
  name: string;
  default_days: string | number;
  is_active: boolean;
};

type Summary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_days: number;
};

const emptySummary: Summary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  total_days: 0,
};

const monthOptions = [
  { label: "All Months", value: "" },
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function LeaveRequestsPage() {
  const router = useRouter();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [dayTypeFilter, setDayTypeFilter] = useState("");
  const [halfDayFilter, setHalfDayFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(true);

  const [summary, setSummary] = useState<Summary>(emptySummary);

  const {
    currentPage,
    recordsPerPage,
    meta,
    setMeta,
    resetPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
  } = usePagination(10);

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - index)
  );

  const fetchActiveLeaveTypes = async () => {
    try {
      setLeaveTypesLoading(true);

      const response = await getActiveLeaveTypes();
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        setLeaveTypes(responseData);
      } else if (Array.isArray(responseData.data)) {
        setLeaveTypes(responseData.data);
      } else {
        setLeaveTypes([]);
      }
    } catch (error) {
      console.log(error);
      setLeaveTypes([]);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getLeaveRequests({
        search,
        status: statusFilter,
        leave_type: leaveTypeFilter,
        day_type: dayTypeFilter,
        half_day_period: halfDayFilter,
        month: monthFilter,
        year: yearFilter,
        from_date: fromDate,
        to_date: toDate,
        page: currentPage,
        per_page: recordsPerPage,
      });

      console.log("Leave requests response:", response.data);

      setLeaves(response.data.data || []);
      setMeta(response.data.meta || emptyPaginationMeta);
      setSummary(response.data.summary || emptySummary);
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (error.response?.status === 403) {
        Swal.fire(
          "Not allowed",
          "You are not allowed to access leave requests.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to fetch leave requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLeaveTypes();
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [
    search,
    statusFilter,
    leaveTypeFilter,
    dayTypeFilter,
    halfDayFilter,
    monthFilter,
    yearFilter,
    fromDate,
    toDate,
    currentPage,
  ]);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setLeaveTypeFilter("");
    setDayTypeFilter("");
    setHalfDayFilter("");
    setMonthFilter("");
    setYearFilter("");
    setFromDate("");
    setToDate("");
    resetPage();
  };

  const getStatusClass = (status: string) => {
    const currentStatus = status?.toLowerCase();

    if (currentStatus === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (currentStatus === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const formatDayType = (dayType?: string) => {
    if (dayType === "half_day") {
      return "Half Day";
    }

    return "Full Day";
  };

  const formatHalfDayPeriod = (period?: string | null) => {
    if (period === "first_half") {
      return "First Half";
    }

    if (period === "second_half") {
      return "Second Half";
    }

    return "-";
  };

  const getAfterApprovalBalance = (leave: Leave) => {
    const requestedDays = Number(leave.total_days || 0);

    if (!leave.current_balance) {
      return 0 - requestedDays;
    }

    return Number(leave.current_balance.remaining_days || 0) - requestedDays;
  };

  const handleApprove = async (leaveId: number) => {
    const result = await Swal.fire({
      title: "Approve leave?",
      text: "This leave request will be approved. If balance is low, it may become negative.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await approveLeave(leaveId);

      Swal.fire(
        "Approved",
        response.data.message || "Leave request approved successfully.",
        response.data.balance_warning ? "warning" : "success"
      );

      fetchLeaveRequests();
    } catch (error: any) {
      console.log("Approve error:", error.response?.data || error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (error.response?.status === 422) {
        Swal.fire(
          "Cannot approve leave",
          error.response.data.message ||
            "This leave request cannot be approved.",
          "error"
        );
        return;
      }

      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to approve leave request.",
        "error"
      );
    }
  };

  const handleReject = async (leaveId: number) => {
    const result = await Swal.fire({
      title: "Reject leave?",
      input: "textarea",
      inputLabel: "Admin remark",
      inputPlaceholder: "Write reason for rejection",
      inputValidator: (value) => {
        if (!value || value.trim().length < 3) {
          return "Please write a short rejection reason.";
        }

        return null;
      },
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    const adminRemark = String(result.value || "").trim();

    try {
      await rejectLeave(leaveId, {
        admin_remark: adminRemark,
      });

      Swal.fire("Rejected", "Leave request rejected successfully.", "success");

      fetchLeaveRequests();
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      Swal.fire("Error", "Failed to reject leave request.", "error");
    }
  };

  if (loading) {
    return <p className="p-6">Loading leave requests...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <p className="text-gray-500">
            Review employee leave requests, balance impact, and approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeaveRequests}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold">{summary.total}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{summary.pending}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold">{summary.approved}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold">{summary.rejected}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Days</p>
          <p className="text-2xl font-bold">{summary.total_days}</p>
        </div>
      </div>

      <div className="border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              placeholder="Employee, email, leave type, reason"
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Leave Type
            </label>
            <select
              value={leaveTypeFilter}
              onChange={(e) =>
                updateFilter(setLeaveTypeFilter, e.target.value)
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">
                {leaveTypesLoading
                  ? "Loading leave types..."
                  : "All Leave Types"}
              </option>

              {leaveTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Day Type</label>
            <select
              value={dayTypeFilter}
              onChange={(e) => updateFilter(setDayTypeFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All Day Types</option>
              <option value="full_day">Full Day</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Half</label>
            <select
              value={halfDayFilter}
              onChange={(e) => updateFilter(setHalfDayFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All</option>
              <option value="first_half">First Half</option>
              <option value="second_half">Second Half</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => updateFilter(setMonthFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => updateFilter(setYearFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All Years</option>

              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => updateFilter(setFromDate, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => updateFilter(setToDate, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Showing {leaves.length} of {meta.total} leave requests
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="border p-6 rounded text-center">
          <p className="text-gray-500">No leave requests found.</p>
        </div>
      ) : (
        <>
          <div className="border rounded overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Employee</th>
                  <th className="border p-3 text-left">Leave Type</th>
                  <th className="border p-3 text-left">Day Type</th>
                  <th className="border p-3 text-left">Half</th>
                  <th className="border p-3 text-left">Start Date</th>
                  <th className="border p-3 text-left">End Date</th>
                  <th className="border p-3 text-left">Total Days</th>
                  <th className="border p-3 text-left">
                    Balance After Approval
                  </th>
                  <th className="border p-3 text-left">Reason</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Admin Remark</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => {
                  const afterApprovalBalance = getAfterApprovalBalance(leave);

                  return (
                    <tr key={leave.id}>
                      <td className="border p-3">
                        <div>
                          <p className="font-medium">
                            {leave.user?.name || "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {leave.user?.email || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="border p-3">{leave.leave_type}</td>

                      <td className="border p-3">
                        {formatDayType(leave.day_type)}
                      </td>

                      <td className="border p-3">
                        {formatHalfDayPeriod(leave.half_day_period)}
                      </td>

                      <td className="border p-3">{leave.start_date}</td>

                      <td className="border p-3">{leave.end_date}</td>

                      <td className="border p-3">{leave.total_days || "-"}</td>

                      <td className="border p-3">
                        {leave.current_balance ? (
                          <div className="text-sm space-y-1">
                            <p>
                              Current:{" "}
                              <span
                                className={
                                  Number(
                                    leave.current_balance.remaining_days
                                  ) < 0
                                    ? "text-red-600 font-bold"
                                    : "text-green-700 font-bold"
                                }
                              >
                                {leave.current_balance.remaining_days}
                              </span>
                            </p>

                            <p>
                              After:{" "}
                              <span
                                className={
                                  afterApprovalBalance < 0
                                    ? "text-red-600 font-bold"
                                    : "text-green-700 font-bold"
                                }
                              >
                                {afterApprovalBalance}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm space-y-1">
                            <p className="text-orange-600 font-medium">
                              No balance found
                            </p>

                            <p>
                              After:{" "}
                              <span className="text-red-600 font-bold">
                                {afterApprovalBalance}
                              </span>
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="border p-3 max-w-xs">{leave.reason}</td>

                      <td className="border p-3">
                        <span
                          className={`px-3 py-1 rounded text-sm capitalize ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="border p-3">
                        {leave.admin_remark || "-"}
                      </td>

                      <td className="border p-3">
                        {leave.status?.toLowerCase() === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(leave.id)}
                              className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(leave.id)}
                              className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </>
      )}
    </div>
  );
}