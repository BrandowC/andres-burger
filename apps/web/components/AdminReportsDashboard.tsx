"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { DashboardReport } from "@/types/report";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_WHATSAPP: "Pedido en WhatsApp",
    CONFIRMED: "Confirmado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] || status;
}

export function AdminReportsDashboard() {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      const response = await apiGet<DashboardReport>("/reports/dashboard");
      setReport(response);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center text-[#061a35]">
        <p className="text-5xl">📊</p>
        <p className="mt-4 text-xl font-black">Cargando reportes...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center text-[#061a35]">
        <p className="text-5xl">⚠️</p>
        <p className="mt-4 text-xl font-black">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Pedidos de hoy
          </p>
          <p className="mt-3 text-4xl font-black">{report.todayOrders}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Ventas de hoy
          </p>
          <p className="mt-3 text-4xl font-black">
            {formatMoney(report.todaySales)}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Pendientes
          </p>
          <p className="mt-3 text-4xl font-black">{report.pendingOrders}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Entregados
          </p>
          <p className="mt-3 text-4xl font-black">{report.deliveredOrders}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <h2 className="text-2xl font-black">Productos más vendidos</h2>

          <div className="mt-5 space-y-3">
            {report.topProducts.length === 0 && (
              <p className="text-slate-500">
                Todavía no hay productos vendidos hoy.
              </p>
            )}

            {report.topProducts.map((product, index) => (
              <article
                key={product.productName}
                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                    #{index + 1}
                  </p>

                  <h3 className="font-black">{product.productName}</h3>

                  <p className="text-sm text-slate-500">
                    {product.quantity} unidad
                    {product.quantity === 1 ? "" : "es"}
                  </p>
                </div>

                <p className="font-black text-blue-700">
                  {formatMoney(product.total)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
          <h2 className="text-2xl font-black">Últimos pedidos de hoy</h2>

          <div className="mt-5 space-y-3">
            {report.recentOrders.length === 0 && (
              <p className="text-slate-500">Todavía no hay pedidos hoy.</p>
            )}

            {report.recentOrders.map((order) => (
              <article key={order.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                      {order.orderCode}
                    </p>

                    <h3 className="font-black">{order.customerName}</h3>

                    <p className="text-sm text-slate-500">
                      📱 {order.customerPhone}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black">
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-blue-700">
                  {formatMoney(order.subtotal)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
