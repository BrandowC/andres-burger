import { AdminAdditionsManager } from "@/components/AdminAdditionsManager";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";

export default function AdminAdditionsPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gradient-to-br from-[#061a35] via-[#0A3670] to-[#061a35] px-5 py-6 text-white">
        <section className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Andrés Burger
              </p>

              <h1 className="text-4xl font-black">Adiciones</h1>

              <p className="mt-2 text-blue-100">
                Crea y edita extras como tocineta, papa, queso, carne o pollo.
              </p>
            </div>

            <AdminNav />
          </header>

          <AdminAdditionsManager />
        </section>
      </main>
    </AdminGuard>
  );
}
