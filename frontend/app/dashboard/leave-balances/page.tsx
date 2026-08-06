"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  deleteLeaveBalance,
  getLeaveBalances,
} from "@/services/leaveBalanceService";
import { getActiveLeaveTypes } from "@/services/leaveTypeService";
import usePagination, {
  emptyPaginationMeta,
} from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";
import useDebounce from "@/hooks/useDebounce";

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

type LeaveType = {
  id: number;
  name: string;
  default_days: string | number;
  is_active: boolean;
};

export default function LeaveBalancesPage() {
  const router = useRouter();

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setSubmitLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(true);

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

  const fetchLeaveBalances = async () => {
    try {
      setSubmitLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getLeaveBalances({
        search: debouncedSearch,
        leave_type: leaveTypeFilter,
        year: yearFilter,
        page: currentPage,
        per_page: recordsPerPage,
      });

      console.log("Leave balances response:", response.data);

      setLeaveBalances(response.data.data || []);
      console.log(response.data.data);
      setMeta(response.data.meta || emptyPaginationMeta);
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
          "You are not allowed to access leave balances.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to fetch leave balances.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLeaveTypes();
  }, []);

  useEffect(() => {
    fetchLeaveBalances();
  }, [debouncedSearch, leaveTypeFilter, yearFilter, currentPage]);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  const resetFilters = () => {
    setSearch("");
    setLeaveTypeFilter("");
    setYearFilter("");
    resetPage();
  };

  const handleDelete = async (balance: LeaveBalance) => {
    const result = await Swal.fire({
      title: "Delete leave balance?",
      text: `Are you sure you want to delete ${balance.leave_type} balance?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteLeaveBalance(balance.id);

      Swal.fire("Deleted", "Leave balance deleted successfully.", "success");

      fetchLeaveBalances();
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
        Swal.fire(
          "Cannot delete",
          error.response.data.message ||
            "This balance cannot be deleted because leave days are already used.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to delete leave balance.", "error");
    }
  };

 

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Leave Balances</h1>
          <p className="text-gray-500">
            Manage employee leave balances by leave type and year.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/leave-balances/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Leave Balance
        </button>
      </div>

      <div className="filter-card border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              placeholder="Employee, email, leave type"
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
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

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 px-4 py-2 rounded w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Showing {leaveBalances.length} of {meta.total} leave balances
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-10">
          Loading...
        </div>
      ) : leaveBalances.length === 0 ? (
        <div className="empty-state border p-6 rounded text-center">
          <p className="text-gray-500">No leave balances found.</p>
        </div>
      ) : (
        <>
          <div className="table-card border rounded overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Employee</th>
                  <th className="border p-3 text-left">Leave Type</th>
                  <th className="border p-3 text-left">Year</th>
                  <th className="border p-3 text-left">Total Days</th>
                  <th className="border p-3 text-left">Used Days</th>
                  <th className="border p-3 text-left">Remaining Days</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaveBalances.map((balance) => (
                  <tr key={balance.id}>
                    <td className="border p-3">
                      <div>
                        <p className="font-medium">
                          {balance.user?.name || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {balance.user?.email || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="border p-3">{balance.leave_type}</td>

                    <td className="border p-3">{balance.year}</td>

                    <td className="border p-3">{balance.total_days}</td>

                    <td className="border p-3">{balance.used_days}</td>

                    <td className="border p-3">
                      <span
                        className={
                          Number(balance.remaining_days) < 0
                            ? "text-red-600 font-bold"
                            : "text-green-700 font-medium"
                        }
                      >
                        {balance.remaining_days}
                      </span>
                    </td>

                    <td className="border p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/leave-balances/edit/${balance.id}`
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(balance)}
                          className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
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