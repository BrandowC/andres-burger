"use client";

import { useRouter } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";

export function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearAdminSession();
    router.push("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white"
    >
      Salir
    </button>
  );
}
