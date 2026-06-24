"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";
import { InstallPWAButton } from "@/components/InstallPWAButton";

const adminLinks = [
  {
    label: "Reportes",
    href: "/admin/reportes",
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
  },
  {
    label: "Productos",
    href: "/admin/productos",
  },
  {
    label: "Adiciones",
    href: "/admin/adiciones",
  },
  {
    label: "Ver menú",
    href: "/menu",
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAdminSession();
    router.push("/admin/login");
  }

  function getLinkClass(href: string) {
    const isActive = pathname === href;

    if (href === "/menu") {
      return "rounded-2xl bg-white px-5 py-3 font-black text-[#061a35] transition hover:scale-105";
    }

    if (isActive) {
      return "rounded-2xl bg-cyan-300 px-5 py-3 font-black text-[#061a35] shadow-xl shadow-cyan-300/20 transition hover:scale-105";
    }

    return "rounded-2xl bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/20";
  }

  return (
    <nav className="flex flex-wrap items-center gap-3">
      <InstallPWAButton />

      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={getLinkClass(link.href)}
        >
          {link.label}
        </Link>
      ))}

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white shadow-xl shadow-red-500/20 transition hover:scale-105 hover:bg-red-600"
      >
        Salir
      </button>
    </nav>
  );
}
