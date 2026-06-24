import { AdminGuard } from "@/components/AdminGuard";
import { AdminOrdersKanban } from "@/components/AdminOrdersKanban";
import { AdminNav } from "@/components/AdminNav";

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#061a35] px-5 py-6 text-white">
        <section className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-200">
                Andrés Burger
              </p>

              <h1 className="text-4xl font-black">Panel de pedidos</h1>

              <p className="mt-2 text-blue-100">
                Organiza los pedidos por estado y confirma el avance del
                negocio.
              </p>
            </div>

            <AdminNav />
          </header>

          <AdminOrdersKanban />
        </section>
      </main>
    </AdminGuard>
  );
}
