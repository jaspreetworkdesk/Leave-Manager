"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  getLeaveType,
  updateLeaveType,
} from "@/services/leaveTypeService";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import Button from "@/components/ui/Button";

type FormErrors = {
  name?: string;
  default_days?: string;
  is_active?: string;
};

export default function EditLeaveTypePage() {
  const router = useRouter();
  const params = useParams();

  const leaveTypeId = params.id as string;

  const [name, setName] = useState("");
  const [defaultDays, setDefaultDays] = useState("");
  const [isActive, setIsActive] = useState("1");

  const [errors, setErrors] = useState<FormErrors>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchLeaveType = async () => {
    try {
      setPageLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Login required", "Please login again.", "error");
        router.push("/login");
        return;
      }

      const response = await getLeaveType(leaveTypeId);

      console.log("Leave type detail:", response.data);

      setName(response.data.name || "");
      setDefaultDays(String(response.data.default_days || ""));
      setIsActive(response.data.is_active ? "1" : "0");
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
          "You are not allowed to edit leave types.",
          "error"
        );
        router.push("/dashboard/leave-types");
        return;
      }

      Swal.fire("Error", "Failed to fetch leave type.", "error");
      router.push("/dashboard/leave-types");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (leaveTypeId) {
      fetchLeaveType();
    }
  }, [leaveTypeId]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Leave type name is required.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Leave type name must be at least 3 characters.";
    }

    if (!defaultDays) {
      newErrors.default_days = "Default days are required.";
    } else if (Number(defaultDays) < 0) {
      newErrors.default_days = "Default days cannot be negative.";
    } else if (Number(defaultDays) > 365) {
      newErrors.default_days = "Default days cannot be more than 365.";
    }

    if (isActive === "") {
      newErrors.is_active = "Status is required.";
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
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire("Login required", "Please login again.", "error");
        router.push("/login");
        return;
      }

      await updateLeaveType(leaveTypeId, {
        name: name.trim(),
        default_days: defaultDays,
        is_active: isActive === "1",
      });

      Swal.fire("Success", "Leave type updated successfully.", "success");

      router.push("/dashboard/leave-types");
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
          "You are not allowed to update leave types.",
          "error"
        );
        return;
      }

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;

        setErrors({
          name: backendErrors?.name?.[0],
          default_days: backendErrors?.default_days?.[0],
          is_active: backendErrors?.is_active?.[0],
        });

        Swal.fire(
          "Validation error",
          error.response.data.message || "Please check the form fields.",
          "error"
        );

        return;
      }

      Swal.fire("Error", "Failed to update leave type.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <p className="p-6">Loading leave type...</p>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Leave Type</h1>
        <p className="text-gray-500">
          Update leave type name, default days, and active status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded">
        <FormInput
          label="Leave Type Name"
          value={name}
          placeholder="Example: Sick Leave"
          error={errors.name}
          onChange={setName}
        />

        <FormInput
          label="Default Days"
          type="number"
          value={defaultDays}
          placeholder="Example: 10"
          error={errors.default_days}
          onChange={setDefaultDays}
        />

        <FormSelect
          label="Status"
          value={isActive}
          error={errors.is_active}
          onChange={setIsActive}
          options={[
            { label: "Active", value: "1" },
            { label: "Inactive", value: "0" },
          ]}
        />

        <div className="bg-orange-50 text-orange-700 p-4 rounded text-sm">
          If this leave type is already used in leaves or leave balances, the
          backend will not allow changing its name. You can deactivate it
          instead.
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Update Leave Type
          </Button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/leave-types")}
            className="bg-gray-200 px-5 py-3 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}