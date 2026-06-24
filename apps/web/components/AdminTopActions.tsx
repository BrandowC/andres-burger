"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";

export function AdminTopActions() {
  const router = useRouter();

  function handleLogout() {
    clearAdminSession();
    router.push("/admin/login");
  }

  return (
    <nav className="flex flex-wrap gap-3">
      <Link
        href="/admin/pedidos"
        className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95"
      >
        Pedidos
      </Link>

      <Link
        href="/admin/productos"
        className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 active:scale-95"
      >
        Productos
      </Link>

      <Link
        href="/menu"
        className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-[#061a35] shadow-lg shadow-cyan-300/30 transition hover:scale-105 active:scale-95"
      >
        Ver menú
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/30 transition hover:scale-105 active:scale-95"
      >
        Salir
      </button>
    </nav>
  );
}
