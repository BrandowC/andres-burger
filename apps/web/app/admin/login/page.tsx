"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { saveAdminSession } from "@/lib/auth";
import { LoginRequest, LoginResponse } from "@/types/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      alert("Escribe el correo.");
      return;
    }

    if (!password.trim()) {
      alert("Escribe la contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiPost<LoginResponse, LoginRequest>(
        "/auth/login",
        {
          email,
          password,
        },
      );

      saveAdminSession(response.accessToken, response.user);

      router.push("/admin/reportes");
    } catch (error) {
      console.error(error);
      alert("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061a35] px-5 text-white">
      <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-white text-6xl">
            🍔
          </div>

          <h1 className="text-4xl font-black">Panel privado</h1>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-blue-100">Correo</span>

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo del administrador"
              autoComplete="off"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-blue-100">Contraseña</span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35] shadow-xl shadow-cyan-300/30 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar al panel"}
          </button>
        </div>
      </form>
    </main>
  );
}
