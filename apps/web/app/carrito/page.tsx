"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/cart.store";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const {
    items,
    subtotal,
    incrementItem,
    decrementItem,
    removeItem,
    updateItemNote,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
        <section className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-900 text-5xl">
            🛒
          </div>

          <h1 className="text-3xl font-black">Tu carrito está vacío</h1>

          <p className="mt-3 text-neutral-400">
            Agrega productos del menú para crear tu pedido.
          </p>

          <Link
            href="/menu"
            className="mt-6 inline-block rounded-2xl bg-amber-500 px-6 py-3 font-bold text-neutral-950"
          >
            Ver menú
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Tu pedido</h1>
            <p className="text-neutral-400">
              Revisa cantidades y agrega notas si necesitas.
            </p>
          </div>

          <Link href="/menu" className="text-sm font-bold text-amber-400">
            Seguir comprando
          </Link>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 text-4xl">
                  {item.emoji || "🍽️"}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-black">{item.name}</h2>

                  <p className="text-sm text-neutral-400">
                    {formatMoney(item.price)} c/u
                  </p>

                  <p className="mt-1 font-bold text-amber-400">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrementItem(item.productId)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 font-black"
                  >
                    -
                  </button>

                  <span className="min-w-8 text-center font-black">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => incrementItem(item.productId)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 font-black"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm font-bold text-red-400"
                >
                  Eliminar
                </button>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-neutral-300">
                  Nota para este producto
                </span>

                <textarea
                  value={item.note || ""}
                  onChange={(event) =>
                    updateItemNote(item.productId, event.target.value)
                  }
                  placeholder="Ej: sin cebolla, sin piña, con salsas aparte..."
                  className="mt-2 min-h-20 w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-3 text-sm outline-none focus:border-amber-500"
                />
              </label>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center justify-between text-lg">
            <span className="font-bold">Subtotal</span>
            <span className="font-black text-amber-400">
              {formatMoney(subtotal)}
            </span>
          </div>

          <p className="mt-2 text-sm text-neutral-400">
            Si eliges domicilio, el valor del domicilio se confirmará
            manualmente por WhatsApp.
          </p>

          <Link
            href="/checkout"
            className="mt-5 block w-full rounded-2xl bg-amber-500 px-6 py-4 text-center text-lg font-black text-neutral-950"
          >
            Continuar
          </Link>
        </section>
      </section>
    </main>
  );
}
