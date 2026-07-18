import api from "@/lib/axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

export const getAdminDashboardStats = (year?: string | number) => {
  return api.get("/admin/dashboard/stats", {
    params: year ? { year } : {},
    headers: getAuthHeaders(),
  });
};

export const getEmployeeDashboardStats = (year?: string | number) => {
  return api.get("/dashboard/stats", {
    params: year ? { year } : {},
    headers: getAuthHeaders(),
  });
};