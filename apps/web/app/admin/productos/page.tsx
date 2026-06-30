import Link from "next/link";
import { AdminCatalogManager } from "@/components/AdminCatalogManager";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { InstallPWAButton } from "@/components/InstallPWAButton";

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-linear-to-br from-[#061a35] via-[#0A3670] to-[#061a35] px-4 py-6 text-white md:px-5">
        <section className="mx-auto max-w-7xl">
          <header className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white text-5xl shadow-2xl">
              🍔
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-cyan-200">
              Andrés Burger
            </p>

            <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">
              Productos y categorías
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-blue-100 md:text-lg">
              Administra el catálogo del negocio: categorías, productos, fotos,
              precios y disponibilidad.
            </p>

            <nav className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-3">
              <InstallPWAButton />

              <Link
                href="/admin/reportes"
                className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/20"
              >
                Reportes
              </Link>

              <Link
                href="/admin/pedidos"
                className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/20"
              >
                Pedidos
              </Link>

              <Link
                href="/admin/productos"
                className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-[#061a35] shadow-xl shadow-cyan-300/20"
              >
                Productos
              </Link>

              <Link
                href="/admin/adiciones"
                className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/20"
              >
                Adiciones
              </Link>

              <Link
                href="/menu"
                className="rounded-2xl bg-white px-5 py-3 font-black text-[#061a35] transition hover:scale-105"
              >
                Ver menú
              </Link>

              <AdminLogoutButton />
            </nav>
          </header>

          <AdminCatalogManager />
        </section>
      </main>
    </AdminGuard>
  );
}
