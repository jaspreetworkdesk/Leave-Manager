"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthUser from "@/hooks/useAuthUser";

type NavigationItem = {
  href: string;
  label: string;
  icon: string;
};

const commonNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
];

const employeeNavigation: NavigationItem[] = [
  { href: "/dashboard/my-leaves", label: "My Leaves", icon: "M" },
  { href: "/dashboard/apply-leave", label: "Apply Leave", icon: "+" },
  { href: "/dashboard/profile", label: "My Profile", icon: "P" },
];

const adminNavigation: NavigationItem[] = [
  { href: "/dashboard/leave-requests", label: "Leave Requests", icon: "R" },
  { href: "/dashboard/employees", label: "Employees", icon: "E" },
  { href: "/dashboard/departments", label: "Departments", icon: "D" },
  { href: "/dashboard/designations", label: "Designations", icon: "J" },
  { href: "/dashboard/leave-types", label: "Leave Types", icon: "T" },
  { href: "/dashboard/leave-balances", label: "Leave Balances", icon: "B" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading, isAdmin, isEmployee } = useAuthUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navigation = useMemo(() => {
    return [
      ...commonNavigation,
      ...(isEmployee ? employeeNavigation : []),
      ...(isAdmin ? adminNavigation : []),
    ];
  }, [isAdmin, isEmployee]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userInitials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  const roleLabel = isAdmin ? "Administrator" : "Employee";

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
        <div className="max-w-sm rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold">Unable to load account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your session may have expired. Please sign in again.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand-row">
          <Link href="/dashboard" className="sidebar-brand">
            <span className="sidebar-brand-mark">LM</span>
            <span className="sidebar-brand-copy">
              <strong>Leave Manager</strong>
              <span>Employee workspace</span>
            </span>
          </Link>

          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="sidebar-section-label">Workspace</p>
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "is-active" : ""}`}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <span className="user-avatar">{userInitials}</span>
            <span className="sidebar-user-copy">
              <strong>{user.name}</strong>
              <span>{roleLabel}</span>
            </span>
          </div>

          <button type="button" onClick={logout} className="sidebar-logout">
            Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="topbar-copy">
            <p>Leave Manager</p>
            <strong>Welcome back, {user.name}</strong>
          </div>

          {isEmployee ? (
            <Link href="/dashboard/profile" className="topbar-user">
              <span className="topbar-user-copy">
                <strong>{user.name}</strong>
                <span>{roleLabel}</span>
              </span>
              <span className="user-avatar">{userInitials}</span>
            </Link>
          ) : (
            <div className="topbar-user">
              <span className="topbar-user-copy">
                <strong>{user.name}</strong>
                <span>{roleLabel}</span>
              </span>
              <span className="user-avatar">{userInitials}</span>
            </div>
          )}
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
