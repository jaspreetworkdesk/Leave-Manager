"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useAuthUser from "@/hooks/useAuthUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading, isAdmin, isEmployee } = useAuthUser();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `block px-4 py-2 rounded transition ${
      isActive(href)
        ? "bg-blue-600 text-white"
        : "text-white hover:bg-blue-600 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h2 className="text-2xl font-bold mb-10">Leave Manager</h2>

        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
          </li>
          {isEmployee && (
             <>
          <li>
            <Link
              href="/dashboard/my-leaves"
              className={linkClass("/dashboard/my-leaves")}
            >
              My Leaves
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/apply-leave"
              className={linkClass("/dashboard/apply-leave")}
            >
              Apply Leave
            </Link>
            
          </li>

          <li>
            <Link
              href="/dashboard/profile"
              className={linkClass("/dashboard/profile")}
            >
            My Profile
            </Link>
            
          </li>
        </>
        )}
          {isAdmin && (
             <>
          <li>
            <Link
              href="/dashboard/leave-requests"
              className={linkClass("/dashboard/leave-requests")}
            >
              Leave Requests
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/employees"
              className={linkClass("/dashboard/employees")}
            >
              Employees
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/departments"
              className={linkClass("/dashboard/departments")}
            >
              Departments
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/designations"
              className={linkClass("/dashboard/designations")}
            >
              Designations
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/leave-types"
              className={linkClass("/dashboard/leave-types")}
            >
              Leave Types
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/leave-balances"
              className={linkClass("/dashboard/leave-balances")}
            >
              Leave Balances
            </Link>
          </li>
          </>
        )}
        </ul>

        <button
          type="button"
          onClick={logout}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-gray-100">{children}</div>
    </div>
  );
}