"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

import { deleteLeaveType, getLeaveTypes } from "@/services/leaveTypeService";
import usePagination, {
  emptyPaginationMeta,
} from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";
import useDebounce from "@/hooks/useDebounce";

type LeaveType = {
  id: number;
  name: string;
  default_days: string | number;
  is_active: boolean;
  created_at?: string;
};

type ApiErrorResponse = {
  message?: string;
};

export default function LeaveTypesPage() {
  const router = useRouter();

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setSubmitLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [activeFilter, setActiveFilter] = useState("");

  const {
    currentPage,
    setCurrentPage,
    recordsPerPage,
    meta,
    setMeta,
    resetPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
  } = usePagination(10);

  const handleUnauthorized = useCallback(() => {
    Swal.fire("Session expired", "Please login again.", "error");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }, [router]);

  const fetchLeaveTypes = useCallback(async () => {
    try {
      setSubmitLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getLeaveTypes({
        search: debouncedSearch,
        is_active: activeFilter,
        page: currentPage,
        per_page: recordsPerPage,
      });

      setLeaveTypes(response.data.data || []);
      setMeta(response.data.meta || emptyPaginationMeta);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      if (axiosError.response?.status === 403) {
        Swal.fire(
          "Not allowed",
          "You are not allowed to access leave types.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to fetch leave types.", "error");
    } finally {
      setSubmitLoading(false);
    }
  }, [
    router,
    debouncedSearch,
    activeFilter,
    currentPage,
    recordsPerPage,
    setMeta,
    handleUnauthorized,
  ]);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("");
    resetPage();
  };

  const handleDelete = async (leaveType: LeaveType) => {
    const result = await Swal.fire({
      title: "Delete leave type?",
      text: `Are you sure you want to delete ${leaveType.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(leaveType.id);

      await deleteLeaveType(leaveType.id);

      Swal.fire("Deleted", "Leave type deleted successfully.", "success");

      if (leaveTypes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        return;
      }

      fetchLeaveTypes();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      if (axiosError.response?.status === 422) {
        Swal.fire(
          "Cannot delete",
          axiosError.response.data.message ||
            "This leave type cannot be deleted because it is already used.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to delete leave type.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Types</h1>
          <p className="text-gray-500">
            Manage leave categories, default days, and active status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/leave-types/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Leave Type
        </button>
      </div>

      <div className="border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              placeholder="Search leave type"
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={activeFilter}
              onChange={(e) => updateFilter(setActiveFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
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

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {leaveTypes.length} of {meta.total} leave types
          </p>

          {loading && (
            <p className="text-sm text-gray-500">Loading leave types...</p>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-10">
          Loading...
        </div>
      
      ) : leaveTypes.length === 0 ? (
        <div className="border p-6 rounded text-center">
          <p className="text-gray-500">No leave types found.</p>
        </div>
      ) : (
        <>
          <div className="border rounded overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Default Days</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaveTypes.map((leaveType) => (
                  <tr key={leaveType.id}>
                    <td className="border p-3 font-medium">
                      {leaveType.name}
                    </td>

                    <td className="border p-3">{leaveType.default_days}</td>

                    <td className="border p-3">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          leaveType.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leaveType.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="border p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/leave-types/edit/${leaveType.id}`
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === leaveType.id}
                          onClick={() => handleDelete(leaveType)}
                          className="bg-red-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                        >
                          {deletingId === leaveType.id
                            ? "Deleting..."
                            : "Delete"}
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