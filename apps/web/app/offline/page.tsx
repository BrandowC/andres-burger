import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061a35] px-6 text-white">
      <section className="max-w-md text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-6xl">
          🍔
        </div>

        <h1 className="mt-6 text-4xl font-black">Sin conexión</h1>

        <p className="mt-4 text-blue-100">
          No tienes internet en este momento. Revisa tu conexión e intenta
          nuevamente.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-2xl bg-cyan-300 px-6 py-4 font-black text-[#061a35]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
