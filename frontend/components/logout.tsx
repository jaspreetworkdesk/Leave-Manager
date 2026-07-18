"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    try {
      setLoading(true);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Button type="button" loading={loading} onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}