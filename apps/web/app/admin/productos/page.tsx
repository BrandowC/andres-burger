import { AdminCatalogManager } from "@/components/AdminCatalogManager";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminNav } from "@/components/AdminNav";

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gradient-to-br from-[#061a35] via-[#0A3670] to-[#061a35] px-5 py-6 text-white">
        <section className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Andrés Burger
              </p>

              <h1 className="text-4xl font-black">Productos y categorías</h1>

              <p className="mt-2 text-blue-100">
                Crea categorías, sube fotos, cambia precios y activa o desactiva
                productos.
              </p>
            </div>

            <AdminNav />
          </header>

          <AdminCatalogManager />
        </section>
      </main>
    </AdminGuard>
  );
}
