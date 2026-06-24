"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/cart.store";
import { formatMoney } from "@/lib/money";

export function CartBar() {
  const { totalItems, subtotal } = useCart();

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">
            {totalItems} producto{totalItems === 1 ? "" : "s"}
          </p>
          <p className="font-black text-amber-400">{formatMoney(subtotal)}</p>
        </div>

        <Link
          href="/carrito"
          className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-neutral-950"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  );
}
