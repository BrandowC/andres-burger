"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { apiGet, apiPatch } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { AdminOrder, AdminOrderStatus } from "@/types/admin-order";

const columns: {
  status: AdminOrderStatus;
  title: string;
  color: string;
}[] = [
  {
    status: "PENDING_WHATSAPP",
    title: "Pedido en WhatsApp",
    color: "bg-yellow-400",
  },
  {
    status: "CONFIRMED",
    title: "Confirmado",
    color: "bg-cyan-300",
  },
  {
    status: "DELIVERED",
    title: "Entregado",
    color: "bg-green-400",
  },
  {
    status: "CANCELLED",
    title: "Cancelado",
    color: "bg-red-400",
  },
];

function DroppableColumn({
  column,
  children,
}: {
  column: (typeof columns)[number];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[290px] flex-1 rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur transition ${
        isOver ? "ring-4 ring-cyan-300/50" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className={`mb-2 h-2 w-12 rounded-full ${column.color}`} />
          <h2 className="text-lg font-black text-white">{column.title}</h2>
        </div>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DraggableOrderCard({
  order,
  onView,
}: {
  order: AdminOrder;
  onView: (order: AdminOrder) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-[1.5rem] bg-white p-4 text-[#061a35] shadow-xl transition ${
        isDragging ? "z-50 opacity-80 ring-4 ring-cyan-300" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              {order.orderCode}
            </p>

            <h3 className="mt-1 text-lg font-black">{order.customerName}</h3>

            <p className="text-sm text-slate-500">📱 {order.customerPhone}</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
            {order.deliveryType === "DELIVERY" ? "Domicilio" : "Recoger"}
          </span>
        </div>

        <div className="mt-3 space-y-1 text-sm">
          {order.items.slice(0, 4).map((item) => (
            <p key={item.id}>
              {item.quantity} {item.productNameSnapshot}
            </p>
          ))}

          {order.items.length > 4 && (
            <p className="text-slate-500">+ {order.items.length - 4} más</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-black text-blue-700">
          {formatMoney(order.subtotal)}
        </span>

        <button
          type="button"
          onClick={() => onView(order)}
          className="rounded-xl bg-[#061a35] px-4 py-2 text-sm font-black text-white"
        >
          Ver
        </button>
      </div>
    </article>
  );
}

export function AdminOrdersKanban() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    }),
  );

  async function loadOrders() {
    try {
      const response = await apiGet<AdminOrder[]>("/orders");
      setOrders(response);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const interval = window.setInterval(() => {
      loadOrders();
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  async function updateStatus(orderId: string, status: AdminOrderStatus) {
    const updatedOrder = await apiPatch<
      AdminOrder,
      { status: AdminOrderStatus }
    >(`/orders/${orderId}/status`, { status });

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    );

    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const orderId = String(event.active.id);
    const newStatus = event.over?.id as AdminOrderStatus | undefined;

    if (!newStatus) return;

    const order = orders.find((item) => item.id === orderId);

    if (!order) return;
    if (order.status === newStatus) return;

    await updateStatus(orderId, newStatus);
  }

  const totalToday = useMemo(() => {
    return orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((acc, order) => acc + order.subtotal, 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center text-[#061a35]">
        <p className="text-4xl">🍔</p>
        <p className="mt-3 font-black">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Pedidos
          </p>
          <p className="mt-2 text-4xl font-black">{orders.length}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Subtotal vendido
          </p>
          <p className="mt-2 text-4xl font-black">{formatMoney(totalToday)}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
            Pendientes
          </p>
          <p className="mt-2 text-4xl font-black">
            {
              orders.filter((order) => order.status === "PENDING_WHATSAPP")
                .length
            }
          </p>
        </div>
      </section>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <section className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((column) => {
            const columnOrders = orders.filter(
              (order) => order.status === column.status,
            );

            return (
              <DroppableColumn key={column.status} column={column}>
                {columnOrders.map((order) => (
                  <DraggableOrderCard
                    key={order.id}
                    order={order}
                    onView={setSelectedOrder}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </section>
      </DndContext>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70">
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-5 text-[#061a35]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                  {selectedOrder.orderCode}
                </p>
                <h2 className="text-3xl font-black">
                  {selectedOrder.customerName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <section className="rounded-3xl bg-slate-50 p-4">
                <p className="font-black">Datos del cliente</p>
                <p>📱 {selectedOrder.customerPhone}</p>
                <p>
                  Entrega:{" "}
                  {selectedOrder.deliveryType === "DELIVERY"
                    ? "Domicilio"
                    : "Recoger en local"}
                </p>

                {selectedOrder.deliveryType === "DELIVERY" && (
                  <>
                    <p>📍 {selectedOrder.address}</p>
                    <p>🏘️ {selectedOrder.neighborhood}</p>
                    <p>📌 {selectedOrder.reference || "Sin referencia"}</p>
                  </>
                )}
              </section>

              <section className="rounded-3xl bg-slate-50 p-4">
                <p className="mb-3 font-black">Pedido</p>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id}>
                      <p className="font-bold">
                        {item.quantity} {item.productNameSnapshot} -{" "}
                        {formatMoney(item.subtotal)}
                      </p>

                      {item.note && (
                        <p className="text-sm text-slate-500">
                          Nota: {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {selectedOrder.customerNote && (
                  <p className="mt-4 text-sm">
                    📝 Nota general: {selectedOrder.customerNote}
                  </p>
                )}

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xl font-black text-blue-700">
                    Subtotal: {formatMoney(selectedOrder.subtotal)}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
