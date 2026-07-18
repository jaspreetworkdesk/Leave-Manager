import api from "@/lib/axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

export type LeaveBalanceFilters = {
  search?: string;
  leave_type?: string;
  year?: string;
  page?: number;
  per_page?: number;
};

export type LeaveBalanceFormData = {
  user_id: string;
  leave_type: string;
  year: string;
  total_days: string;
};

const cleanParams = (params: LeaveBalanceFilters) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
};

export const getLeaveBalances = (params: LeaveBalanceFilters = {}) => {
  return api.get("/admin/leave-balances", {
    params: cleanParams(params),
    headers: getAuthHeaders(),
  });
};

export const getLeaveBalance = (id: string) => {
  return api.get(`/admin/leave-balances/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const createLeaveBalance = (data: LeaveBalanceFormData) => {
  return api.post("/admin/leave-balances", data, {
    headers: getAuthHeaders(),
  });
};

export const updateLeaveBalance = (
  id: string,
  data: Pick<LeaveBalanceFormData, "total_days">
) => {
  return api.patch(`/admin/leave-balances/${id}`, data, {
    headers: getAuthHeaders(),
  });
};

export const deleteLeaveBalance = (id: number) => {
  return api.delete(`/admin/leave-balances/${id}`, {
    headers: getAuthHeaders(),
  });
};