"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { deleteEmployee, getEmployees } from "@/services/employeeService";
import { getDepartments } from "@/services/departmentService";
import { getDesignations } from "@/services/designationService";
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

type Department = {
  id: number;
  name: string;
};

type Designation = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  user_id?: number;
  employee_code?: string;
  phone?: string;
  joining_date?: string;
  status?: string;
  user?: User | null;
  department?: Department | null;
  designation?: Designation | null;
};

export default function EmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  const [loading, setSubmitLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);

      const [departmentResponse, designationResponse] = await Promise.all([
        getDepartments({ per_page: 100 }),
        getDesignations({ per_page: 100 }),
      ]);

      const departmentData = departmentResponse.data;
      const designationData = designationResponse.data;

      setDepartments(
        Array.isArray(departmentData)
          ? departmentData
          : departmentData.data || []
      );

      setDesignations(
        Array.isArray(designationData)
          ? designationData
          : designationData.data || []
      );
    } catch (error) {
      console.log(error);
      setDepartments([]);
      setDesignations([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setSubmitLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await getEmployees({
        search: debouncedSearch,
        department_id: departmentFilter,
        designation_id: designationFilter,
        status: statusFilter,
        page: currentPage,
        per_page: recordsPerPage,
      });

      console.log("Employees response:", response.data);

      setEmployees(response.data.data || []);
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
          "You are not allowed to access employees.",
          "error"
        );
        return;
      }

      Swal.fire("Error", "Failed to fetch employees.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [
    debouncedSearch,
    departmentFilter,
    designationFilter,
    statusFilter,
    currentPage,
  ]);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  const resetFilters = () => {
    setSearch("");
    setDepartmentFilter("");
    setDesignationFilter("");
    setStatusFilter("");
    resetPage();
  };

  const handleDelete = async (employee: Employee) => {
    const result = await Swal.fire({
      title: "Delete employee?",
      text: `Are you sure you want to delete ${
        employee.user?.name || "this employee"
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteEmployee(employee.id);

      Swal.fire("Deleted", "Employee deleted successfully.", "success");

      fetchEmployees();
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        Swal.fire("Session expired", "Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete employee.",
        "error"
      );
    }
  };



  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-gray-500">
            Manage employee records, departments, and designations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/employees/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Employee
        </button>
      </div>

      <div className="filter-card border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              placeholder="Name, email, code"
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) =>
                updateFilter(setDepartmentFilter, e.target.value)
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">
                {dropdownLoading ? "Loading..." : "All Departments"}
              </option>

              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Designation
            </label>
            <select
              value={designationFilter}
              onChange={(e) =>
                updateFilter(setDesignationFilter, e.target.value)
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">
                {dropdownLoading ? "Loading..." : "All Designations"}
              </option>

              {designations.map((designation) => (
                <option key={designation.id} value={designation.id}>
                  {designation.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
          Showing {employees.length} of {meta.total} employees
        </p>
      </div>
        {loading ? (
        <div className="flex justify-center items-center p-10">
          Loading employees...
        </div>
      
      ) : employees.length === 0 ? (
        <div className="empty-state border p-6 rounded text-center">
          <p className="text-gray-500">No employees found.</p>
        </div>
      ) : (
        <>
          <div className="table-card border rounded overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Employee</th>
                  <th className="border p-3 text-left">Code</th>
                  <th className="border p-3 text-left">Phone</th>
                  <th className="border p-3 text-left">Department</th>
                  <th className="border p-3 text-left">Designation</th>
                  <th className="border p-3 text-left">Joining Date</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="border p-3">
                      <div>
                        <p className="font-medium">
                          {employee.user?.name || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {employee.user?.email || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="border p-3">
                      {employee.employee_code || "-"}
                    </td>

                    <td className="border p-3">{employee.phone || "-"}</td>

                    <td className="border p-3">
                      {employee.department?.name || "-"}
                    </td>

                    <td className="border p-3">
                      {employee.designation?.name || "-"}
                    </td>

                    <td className="border p-3">
                      {employee.joining_date || "-"}
                    </td>

                    <td className="border p-3">
                      <span
                        className={`px-3 py-1 rounded text-sm capitalize ${
                          employee.status === "inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {employee.status || "active"}
                      </span>
                    </td>

                    <td className="border p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/employees/edit/${employee.id}`
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee)}
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