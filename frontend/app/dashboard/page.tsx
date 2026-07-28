"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminDashboardStats,
  getEmployeeDashboardStats,
} from "@/services/dashboardService";
import StatCard from "@/components/ui/StatCard";
import useAuthUser from "@/hooks/useAuthUser";

type AdminStats = {
  year: number;
  total_employees: number;
  total_departments: number;
  total_designations: number;
  total_leaves: number;
  pending_leaves: number;
  approved_leaves: number;
  rejected_leaves: number;
  total_leave_balances: number;
  total_used_leave_days: number;
  negative_balances: number;
};

type EmployeeStats = {
  year: number;
  my_total_leaves: number;
  my_pending_leaves: number;
  my_approved_leaves: number;
  my_rejected_leaves: number;
  my_used_leave_days: number;
  my_remaining_leave_days: number;
  my_negative_balances: number;
};

export default function DashboardPage() {
  const { user, authLoading, isAdmin, logout } = useAuthUser();

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(
    null
  );

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - index)
  );

  const fetchDashboardStats = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      if (isAdmin) {
        const response = await getAdminDashboardStats(year);

        console.log("Admin dashboard stats:", response.data);

        setAdminStats(response.data);
        setEmployeeStats(null);
      } else {
        const response = await getEmployeeDashboardStats(year);

        console.log("Employee dashboard stats:", response.data);

        setEmployeeStats(response.data);
        setAdminStats(null);
      }
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        logout();
        return;
      }

      Swal.fire("Error", "Failed to fetch dashboard stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardStats();
    }
  }, [authLoading, user, year]);



  if (!user) {
    return <p className="p-6">User not found.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {user.name}. Here is your {year} summary.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>
      </div>

    {authLoading || loading ? (
      <div className="flex justify-center items-center p-10">
        Loading dashboard...
      </div>
    ) : (
    <>
      {isAdmin && adminStats && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Company Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Employees"
                value={adminStats.total_employees}
                description="Employee records in system"
              />

              <StatCard
                title="Departments"
                value={adminStats.total_departments}
                description="Total departments"
              />

              <StatCard
                title="Designations"
                value={adminStats.total_designations}
                description="Total job designations"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Leave Requests</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Leaves"
                value={adminStats.total_leaves}
                description={`Leave requests in ${adminStats.year}`}
              />

              <StatCard
                title="Pending Leaves"
                value={adminStats.pending_leaves}
                description="Waiting for admin action"
                warning={adminStats.pending_leaves > 0}
              />

              <StatCard
                title="Approved Leaves"
                value={adminStats.approved_leaves}
                description="Approved leave requests"
              />

              <StatCard
                title="Rejected Leaves"
                value={adminStats.rejected_leaves}
                description="Rejected leave requests"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Leave Balance Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Leave Balance Records"
                value={adminStats.total_leave_balances}
                description="Employee leave balance records"
              />

              <StatCard
                title="Used Leave Days"
                value={adminStats.total_used_leave_days}
                description={`Total used days in ${adminStats.year}`}
              />

              <StatCard
                title="Negative Balances"
                value={adminStats.negative_balances}
                description="Employees with negative balance"
                warning={adminStats.negative_balances > 0}
              />
            </div>
          </div>
        </div>
      )}

      {!isAdmin && employeeStats && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">My Leave Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="My Total Leaves"
                value={employeeStats.my_total_leaves}
                description={`Leave requests in ${employeeStats.year}`}
              />

              <StatCard
                title="Pending Leaves"
                value={employeeStats.my_pending_leaves}
                description="Waiting for admin approval"
                warning={employeeStats.my_pending_leaves > 0}
              />

              <StatCard
                title="Approved Leaves"
                value={employeeStats.my_approved_leaves}
                description="Approved by admin"
              />

              <StatCard
                title="Rejected Leaves"
                value={employeeStats.my_rejected_leaves}
                description="Rejected by admin"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">My Balance Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Used Leave Days"
                value={employeeStats.my_used_leave_days}
                description={`Used days in ${employeeStats.year}`}
              />

              <StatCard
                title="Remaining Leave Days"
                value={employeeStats.my_remaining_leave_days}
                description="Total remaining days across leave types"
                warning={employeeStats.my_remaining_leave_days < 0}
              />

              <StatCard
                title="Negative Balances"
                value={employeeStats.my_negative_balances}
                description="Leave types with negative balance"
                warning={employeeStats.my_negative_balances > 0}
              />
            </div>
          </div>
        </div>
      )}
    </>
    )}
    </div>
  );
}