import { AdminGuard } from "@/components/AdminGuard";
import { AdminReportsDashboard } from "@/components/AdminReportsDashboard";
import { AdminNav } from "@/components/AdminNav";

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gradient-to-br from-[#061a35] via-[#0A3670] to-[#061a35] px-5 py-6 text-white">
        <section className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Andrés Burger
              </p>

              <h1 className="text-4xl font-black">Reportes</h1>

              <p className="mt-2 text-blue-100">
                Revisa ventas, pedidos del día y productos más vendidos.
              </p>
            </div>

            <AdminNav />
          </header>

          <AdminReportsDashboard />
        </section>
      </main>
    </AdminGuard>
  );
}
