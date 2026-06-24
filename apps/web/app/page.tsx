import Link from "next/link";
import { HiddenAdminEntry } from "@/components/HiddenAdminEntry";

const foodPattern = [
  "🍔",
  "🌭",
  "🍟",
  "🥤",
  "🌽",
  "🥩",
  "🍗",
  "🥓",
  "🧀",
  "🍞",
  "🍔",
  "🌭",
  "🍟",
  "🥤",
  "🌽",
  "🥩",
];

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B2A55] via-[#0A3A78] to-[#06162D] px-6 text-white">
      <div className="absolute inset-0 opacity-15">
        <div className="grid h-full w-full grid-cols-4 gap-10 p-8 sm:grid-cols-6 md:grid-cols-8">
          {foodPattern.map((icon, index) => (
            <div
              key={`${icon}-${index}`}
              className="flex items-center justify-center text-5xl blur-[0.2px]"
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-yellow-300/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

      <section className="relative w-full max-w-md animate-[fadeIn_0.8s_ease-out] text-center">
        <div className="mx-auto mb-7 flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-white text-7xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition hover:scale-105">
          🍔
        </div>

        <HiddenAdminEntry>
          <h1 className="text-5xl font-black tracking-tight drop-shadow-lg sm:text-6xl">
            Andrés Burger
          </h1>
        </HiddenAdminEntry>

        <p className="mx-auto mt-5 max-w-sm text-xl font-semibold leading-relaxed text-blue-50">
          El antojo empieza aquí. Pide rápido, fácil y con todo el sabor de la
          casa.
        </p>

        <Link
          href="/menu"
          className="group mt-10 block rounded-[1.7rem] bg-gradient-to-r from-cyan-300 via-white to-yellow-200 px-6 py-5 text-xl font-black text-[#061a35] shadow-[0_20px_70px_rgba(34,211,238,0.35)] transition hover:scale-[1.03] hover:shadow-[0_25px_90px_rgba(255,255,255,0.45)] active:scale-95"
        >
          <span className="inline-block transition group-hover:tracking-wide">
            Entrar al menú
          </span>
        </Link>

        <p className="mt-7 text-base font-semibold text-blue-100">
          Lunes a domingo · 4:00 p.m. a 12:00 a.m.
        </p>
      </section>
    </main>
  );
}
