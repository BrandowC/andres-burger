"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/features/cart/cart.store";
import {
  CreateOrderDto,
  CreateOrderResponse,
  DeliveryType,
  PaymentMethod,
} from "@/types/order";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [reference, setReference] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [gpsStatus, setGpsStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("Tu navegador no permite usar GPS.");
      return;
    }

    setGpsStatus("Solicitando ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsStatus("Ubicación GPS capturada correctamente.");
      },
      () => {
        setGpsStatus("No se pudo obtener la ubicación. Escríbela manualmente.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!customerName.trim()) {
      alert("Escribe tu nombre.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Escribe tu número de celular.");
      return;
    }

    if (deliveryType === "DELIVERY") {
      if (!address.trim()) {
        alert("Escribe la dirección del domicilio.");
        return;
      }

      if (!neighborhood.trim()) {
        alert("Escribe el barrio.");
        return;
      }
    }

    const body: CreateOrderDto = {
      businessSlug: "andre-burger",
      customerName,
      customerPhone,
      deliveryType,
      paymentMethod,
      address: deliveryType === "DELIVERY" ? address : undefined,
      neighborhood: deliveryType === "DELIVERY" ? neighborhood : undefined,
      reference: deliveryType === "DELIVERY" ? reference : undefined,
      latitude,
      longitude,
      customerNote,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note,
        additions: [],
      })),
    };

    try {
      setLoading(true);

      const response = await apiPost<CreateOrderResponse, CreateOrderDto>(
        "/orders",
        body,
      );

      clearCart();

      window.location.href = response.whatsappUrl;
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el pedido. Revisa los datos e intenta otra vez.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
        <section className="max-w-md text-center">
          <h1 className="text-3xl font-black">No tienes productos</h1>

          <p className="mt-3 text-neutral-400">
            Agrega productos al carrito antes de confirmar el pedido.
          </p>

          <Link
            href="/menu"
            className="mt-6 inline-block rounded-2xl bg-amber-500 px-6 py-3 font-bold text-neutral-950"
          >
            Volver al menú
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/carrito" className="text-sm font-bold text-amber-400">
            ← Volver al carrito
          </Link>

          <h1 className="mt-4 text-3xl font-black">Confirmar pedido</h1>

          <p className="text-neutral-400">
            Al finalizar se abrirá WhatsApp con tu pedido listo para enviar.
          </p>
        </div>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black">Datos del cliente</h2>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="text-sm font-bold text-neutral-300">Nombre</span>

              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Ej: Steven Claros Polanía"
                className="mt-2 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-neutral-300">
                Número de celular
              </span>

              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Ej: 3043800967"
                className="mt-2 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
              />
            </label>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black">Entrega</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDeliveryType("PICKUP")}
              className={`rounded-2xl border p-4 text-left font-bold ${
                deliveryType === "PICKUP"
                  ? "border-amber-500 bg-amber-500 text-neutral-950"
                  : "border-neutral-700 bg-neutral-950"
              }`}
            >
              🚶 Recoger en local
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType("DELIVERY")}
              className={`rounded-2xl border p-4 text-left font-bold ${
                deliveryType === "DELIVERY"
                  ? "border-amber-500 bg-amber-500 text-neutral-950"
                  : "border-neutral-700 bg-neutral-950"
              }`}
            >
              🏍️ Domicilio
            </button>
          </div>

          {deliveryType === "DELIVERY" && (
            <div className="mt-5 grid gap-4">
              <label>
                <span className="text-sm font-bold text-neutral-300">
                  Dirección
                </span>

                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Ej: Carrera 10 # 5-20"
                  className="mt-2 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-neutral-300">
                  Barrio
                </span>

                <input
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  placeholder="Ej: Las Palmas"
                  className="mt-2 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-neutral-300">
                  Referencia
                </span>

                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Ej: Casa azul, segundo piso..."
                  className="mt-2 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
                />
              </label>

              <button
                type="button"
                onClick={handleGetLocation}
                className="rounded-2xl border border-neutral-700 bg-neutral-950 px-5 py-4 text-left font-bold"
              >
                📍 Usar GPS
              </button>

              {gpsStatus && (
                <p className="text-sm text-neutral-400">{gpsStatus}</p>
              )}

              {latitude && longitude && (
                <p className="text-xs text-neutral-500">
                  Coordenadas: {latitude}, {longitude}
                </p>
              )}

              <p className="text-sm text-neutral-400">
                El domicilio se confirma manualmente por WhatsApp. Aquí solo se
                calcula el subtotal del pedido.
              </p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black">Método de pago</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { value: "CASH", label: "💵 Efectivo" },
              { value: "NEQUI", label: "📲 Nequi" },
              { value: "BANCOLOMBIA", label: "🏦 Bancolombia" },
              { value: "QR", label: "🔳 QR" },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                className={`rounded-2xl border p-4 text-left font-bold ${
                  paymentMethod === method.value
                    ? "border-amber-500 bg-amber-500 text-neutral-950"
                    : "border-neutral-700 bg-neutral-950"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black">Nota general</h2>

          <textarea
            value={customerNote}
            onChange={(event) => setCustomerNote(event.target.value)}
            placeholder="Ej: Hamburguesa doble sin cebolla, perro sencillo sin piña..."
            className="mt-4 min-h-28 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-4 outline-none focus:border-amber-500"
          />
        </section>

        <section className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-black">Resumen</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span>
                  {item.emoji} {item.quantity} {item.name}
                </span>

                <span className="font-bold">
                  {formatMoney(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-neutral-800 pt-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold">
                {deliveryType === "DELIVERY" ? "Subtotal" : "Total"}
              </span>

              <span className="font-black text-amber-400">
                {formatMoney(subtotal)}
              </span>
            </div>

            {deliveryType === "DELIVERY" && (
              <p className="mt-2 text-sm text-neutral-400">
                Domicilio y total final por confirmar en WhatsApp.
              </p>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 mt-8 border-t border-neutral-800 bg-neutral-950 py-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-lg font-black text-neutral-950 disabled:opacity-60"
          >
            {loading ? "Creando pedido..." : "Confirmar pedido por WhatsApp"}
          </button>
        </div>
      </form>
    </main>
  );
}
