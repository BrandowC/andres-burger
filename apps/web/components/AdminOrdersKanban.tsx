"use client";

import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
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

function getColumnTitle(status: AdminOrderStatus) {
  return columns.find((column) => column.status === status)?.title || status;
}

function DroppableColumn({
  column,
  count,
  children,
}: {
  column: (typeof columns)[number];
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[290px] flex-1 rounded-[2rem] border p-4 backdrop-blur transition-all duration-200 ${
        isOver
          ? "border-cyan-300 bg-cyan-300/15 ring-4 ring-cyan-300/30"
          : "border-white/10 bg-white/10"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className={`mb-2 h-2 w-12 rounded-full ${column.color}`} />
          <h2 className="text-lg font-black text-white">{column.title}</h2>
        </div>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-3 text-sm font-black text-[#061a35]">
          {count}
        </span>
      </div>

      <div className="min-h-[180px] space-y-3">
        {children}

        {count === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-white/20 p-5 text-center text-sm font-semibold text-blue-100">
            Arrastra pedidos aquí
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onView,
  dragging = false,
}: {
  order: AdminOrder;
  onView?: (order: AdminOrder) => void;
  dragging?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] bg-white p-4 text-[#061a35] shadow-xl transition ${
        dragging ? "scale-[1.03] ring-4 ring-cyan-300" : ""
      }`}
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

      <div className="mt-4 flex items-center justify-between">
        <span className="font-black text-blue-700">
          {formatMoney(order.subtotal)}
        </span>

        {onView && (
          <button
            type="button"
            onClick={() => onView(order)}
            className="rounded-xl bg-[#061a35] px-4 py-2 text-sm font-black text-white"
          >
            Ver
          </button>
        )}
      </div>
    </article>
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
      data: {
        order,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none transition-opacity ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <OrderCard order={order} onView={onView} />
      </div>
    </div>
  );
}

export function AdminOrdersKanban() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [dragging, setDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
  );

  async function loadOrders() {
    try {
      const response = await apiGet<AdminOrder[]>("/orders");
      setOrders(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const interval = window.setInterval(() => {
      if (!dragging) {
        loadOrders();
      }
    }, 15000);

    return () => window.clearInterval(interval);
  }, [dragging]);

  function handleDragStart(event: DragStartEvent) {
    const orderId = String(event.active.id);
    const order = orders.find((item) => item.id === orderId) || null;

    setActiveOrder(order);
    setDragging(true);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const orderId = String(event.active.id);
    const newStatus = event.over?.id as AdminOrderStatus | undefined;

    setActiveOrder(null);
    setDragging(false);

    if (!newStatus) return;

    const currentOrder = orders.find((item) => item.id === orderId);

    if (!currentOrder) return;
    if (currentOrder.status === newStatus) return;

    const previousOrders = orders;

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order,
      ),
    );

    try {
      const updatedOrder = await apiPatch<
        AdminOrder,
        { status: AdminOrderStatus }
      >(`/orders/${orderId}/status`, { status: newStatus });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } catch (error) {
      console.error(error);
      setOrders(previousOrders);
      alert("No se pudo cambiar el estado del pedido.");
    }
  }

  function handleDragCancel() {
    setActiveOrder(null);
    setDragging(false);
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <section className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((column) => {
            const columnOrders = orders.filter(
              (order) => order.status === column.status,
            );

            return (
              <DroppableColumn
                key={column.status}
                column={column}
                count={columnOrders.length}
              >
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

        <DragOverlay>
          {activeOrder ? <OrderCard order={activeOrder} dragging /> : null}
        </DragOverlay>
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
                <p>Estado: {getColumnTitle(selectedOrder.status)}</p>
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
