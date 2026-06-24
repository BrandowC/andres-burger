"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { clearAdminSession, getAdminToken } from "@/lib/auth";
import { AdminUser } from "@/lib/auth";

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const token = getAdminToken();

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        await apiGet<AdminUser>("/auth/me");
        setChecking(false);
      } catch {
        clearAdminSession();
        router.replace("/admin/login");
      }
    }

    verifySession();
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061a35] px-5 text-white">
        <section className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-6xl">
            🍔
          </div>

          <h1 className="mt-5 text-3xl font-black">Validando sesión...</h1>

          <p className="mt-2 text-blue-100">
            Estamos verificando tu acceso al panel.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
