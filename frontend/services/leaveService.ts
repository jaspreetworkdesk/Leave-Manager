import api from "@/lib/axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

export type ApplyLeaveData = {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  day_type: string;
  half_day_period?: string | null;
};

export type LeaveStatusData = {
  admin_remark?: string;
};

export type LeaveFilters = {
  search?: string;
  status?: string;
  leave_type?: string;
  day_type?: string;
  half_day_period?: string;
  month?: string;
  year?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
};

const cleanParams = (params: LeaveFilters) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
};

export const applyLeave = (data: ApplyLeaveData) => {
  return api.post("/leaves", data, {
    headers: getAuthHeaders(),
  });
};

export const getMyLeaves = (params: LeaveFilters = {}) => {
  return api.get("/my-leaves", {
    params: cleanParams(params),
    headers: getAuthHeaders(),
  });
};

export const getLeaveRequests = (params: LeaveFilters = {}) => {
  return api.get("/admin/leaves", {
    params: cleanParams(params),
    headers: getAuthHeaders(),
  });
};

export const approveLeave = (leaveId: number, data: LeaveStatusData = {}) => {
  return api.patch(`/admin/leaves/${leaveId}/approve`, data, {
    headers: getAuthHeaders(),
  });
};

export const rejectLeave = (leaveId: number, data: LeaveStatusData = {}) => {
  return api.patch(`/admin/leaves/${leaveId}/reject`, data, {
    headers: getAuthHeaders(),
  });
};

export const getMyLeaveBalances = (year?: string | number) => {
  return api.get("/my-leave-balances", {
    params: year ? { year } : {},
    headers: getAuthHeaders(),
  });
};