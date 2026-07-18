import api from "@/lib/axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

export type LeaveTypeFilters = {
  search?: string;
  is_active?: string;
  page?: number;
  per_page?: number;
};

export type LeaveTypeFormData = {
  name: string;
  default_days: string;
  is_active: boolean;
};

const cleanParams = (params: LeaveTypeFilters) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
};

export const getLeaveTypes = (params: LeaveTypeFilters = {}) => {
  return api.get("/admin/leave-types", {
    params: cleanParams(params),
    headers: getAuthHeaders(),
  });
};

export const getActiveLeaveTypes = () => {
  return api.get("/leave-types/active", {
    headers: getAuthHeaders(),
  });
};

export const getLeaveType = (id: string) => {
  return api.get(`/admin/leave-types/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const createLeaveType = (data: LeaveTypeFormData) => {
  return api.post("/admin/leave-types", data, {
    headers: getAuthHeaders(),
  });
};

export const updateLeaveType = (id: string, data: LeaveTypeFormData) => {
  return api.patch(`/admin/leave-types/${id}`, data, {
    headers: getAuthHeaders(),
  });
};

export const deleteLeaveType = (id: number) => {
  return api.delete(`/admin/leave-types/${id}`, {
    headers: getAuthHeaders(),
  });
};