"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";

import { createLeaveBalance } from "@/services/leaveBalanceService";
import { getActiveLeaveTypes } from "@/services/leaveTypeService";
import { getEmployees } from "@/services/employeeService";

import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import Button from "@/components/ui/Button";

type User = {
  id: number;
  name: string;
  email: string;
};

type Employee = {
  id: number;
  user_id?: number;
  employee_code?: string;
  user?: User | null;
};

type LeaveType = {
  id: number;
  name: string;
  default_days: string | number;
  is_active: boolean;
};

type FormErrors = {
  user_id?: string;
  leave_type?: string;
  year?: string;
  total_days?: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: {
    user_id?: string[];
    leave_type?: string[];
    year?: string[];
    total_days?: string[];
  };
};

export default function CreateLeaveBalancePage() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 6 }, (_, index) =>
    String(currentYear - index)
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [totalDays, setTotalDays] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const handleUnauthorized = useCallback(() => {
    Swal.fire("Session expired", "Please login again.", "error");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }, [router]);

  const getEmployeesFromResponse = (responseData: any): Employee[] => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.data?.data)) {
      return responseData.data.data;
    }

    return [];
  };

  const getLeaveTypesFromResponse = (responseData: any): LeaveType[] => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.data?.data)) {
      return responseData.data.data;
    }

    return [];
  };

  const fetchPageData = useCallback(async () => {
    try {
      setPageLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const [employeesResponse, leaveTypesResponse] = await Promise.all([
        getEmployees({
          page: 1,
          per_page: 100,
        }),
        getActiveLeaveTypes(),
      ]);

      setEmployees(getEmployeesFromResponse(employeesResponse.data));
      setLeaveTypes(getLeaveTypesFromResponse(leaveTypesResponse.data));
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      if (axiosError.response?.status === 403) {
        Swal.fire(
          "Not allowed",
          "You are not allowed to access this page.",
          "error"
        );

        router.push("/dashboard/leave-balances");
        return;
      }

      Swal.fire("Error", "Failed to load form data.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [router, handleUnauthorized]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const selectedLeaveType = useMemo(() => {
    return leaveTypes.find((type) => type.name === leaveType);
  }, [leaveTypes, leaveType]);

  useEffect(() => {
    if (selectedLeaveType) {
      setTotalDays(String(selectedLeaveType.default_days));
    }
  }, [selectedLeaveType]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!userId) {
      newErrors.user_id = "Employee is required.";
    }

    if (!leaveType) {
      newErrors.leave_type = "Leave type is required.";
    }

    if (!year) {
      newErrors.year = "Year is required.";
    }

    if (!totalDays) {
      newErrors.total_days = "Total days is required.";
    } else if (Number.isNaN(Number(totalDays))) {
      newErrors.total_days = "Total days must be a valid number.";
    } else if (Number(totalDays) < 0) {
      newErrors.total_days = "Total days cannot be negative.";
    } else if (Number(totalDays) > 365) {
      newErrors.total_days = "Total days cannot be more than 365.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitLoading(true);
      setErrors({});

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Login required", "Please login again.", "error");
        router.push("/login");
        return;
      }

      await createLeaveBalance({
        user_id: userId,
        leave_type: leaveType,
        year,
        total_days: totalDays,
      });

      Swal.fire("Success", "Leave balance saved successfully.", "success");

      router.push("/dashboard/leave-balances");
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      if (axiosError.response?.status === 403) {
        Swal.fire(
          "Not allowed",
          "You are not allowed to create leave balances.",
          "error"
        );
        return;
      }

      if (axiosError.response?.status === 422) {
        const backendErrors = axiosError.response.data.errors;

        setErrors({
          user_id: backendErrors?.user_id?.[0],
          leave_type: backendErrors?.leave_type?.[0],
          year: backendErrors?.year?.[0],
          total_days: backendErrors?.total_days?.[0],
        });

        Swal.fire(
          "Validation error",
          axiosError.response.data.message || "Please check the form fields.",
          "error"
        );

        return;
      }

      Swal.fire(
        "Error",
        axiosError.response?.data.message || "Failed to save leave balance.",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return <p className="p-6">Loading leave balance form...</p>;
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Leave Balance</h1>
        <p className="text-gray-500">
          Assign yearly leave quota to an employee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border rounded p-6 space-y-5">
        <FormSelect
          label="Employee"
          value={userId}
          error={errors.user_id}
          onChange={setUserId}
          options={[
            { label: "Select employee", value: "" },
            ...employees.map((employee) => {
              const employeeUserId = employee.user_id || employee.user?.id;

              return {
                label: `${employee.user?.name || "Employee"} ${
                  employee.employee_code ? `(${employee.employee_code})` : ""
                }`,
                value: employeeUserId ? String(employeeUserId) : "",
              };
            }),
          ]}
        />

        <FormSelect
          label="Leave Type"
          value={leaveType}
          error={errors.leave_type}
          onChange={setLeaveType}
          options={[
            { label: "Select leave type", value: "" },
            ...leaveTypes.map((type) => ({
              label: `${type.name} (${type.default_days} days)`,
              value: type.name,
            })),
          ]}
        />

        <FormSelect
          label="Year"
          value={year}
          error={errors.year}
          onChange={setYear}
          options={yearOptions.map((yearOption) => ({
            label: yearOption,
            value: yearOption,
          }))}
        />

        <FormInput
          label="Total Days"
          type="number"
          value={totalDays}
          placeholder="Example: 10"
          error={errors.total_days}
          onChange={setTotalDays}
        />

        <div className="flex gap-3">
          <Button type="submit" loading={submitLoading}>
            Save Leave Balance
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