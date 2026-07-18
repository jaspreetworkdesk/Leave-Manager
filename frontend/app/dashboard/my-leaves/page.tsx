"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getMyLeaves } from "@/services/leaveService";
import { getActiveLeaveTypes } from "@/services/leaveTypeService";
import usePagination, {
  emptyPaginationMeta,
} from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

type Leave = {
  id: number;
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

export default function MyLeavesPage() {
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

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getMyLeaves({
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

      console.log("My leaves response:", response.data);

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

      Swal.fire("Error", "Failed to fetch your leaves.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLeaveTypes();
  }, []);

  useEffect(() => {
    fetchMyLeaves();
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

  if (loading) {
    return <p className="p-6">Loading your leaves...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Leaves</h1>
          <p className="text-gray-500">
            View your leave requests, approval status, and admin remarks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/apply-leave")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Leave
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
              placeholder="Search leave type or reason"
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
                  <th className="border p-3 text-left">Leave Type</th>
                  <th className="border p-3 text-left">Day Type</th>
                  <th className="border p-3 text-left">Half</th>
                  <th className="border p-3 text-left">Start Date</th>
                  <th className="border p-3 text-left">End Date</th>
                  <th className="border p-3 text-left">Total Days</th>
                  <th className="border p-3 text-left">Reason</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Admin Remark</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
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
                  </tr>
                ))}
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