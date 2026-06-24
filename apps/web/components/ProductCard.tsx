"use client";

import { Product } from "@/types/menu";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/features/cart/cart.store";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      imageUrl: product.imageUrl,
      quantity: 0,
      additions: [],
    });
  }

  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-4 flex h-36 items-center justify-center rounded-2xl bg-neutral-800 text-6xl">
        {product.emoji || "🍽️"}
      </div>

      <h3 className="text-lg font-bold">{product.name}</h3>

      <p className="mt-1 min-h-10 text-sm text-neutral-400">
        {product.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-lg font-black text-amber-400">
          {formatMoney(product.price)}
        </span>

        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-neutral-950 transition active:scale-95"
        >
          Agregar
        </button>
      </div>
    </article>
  );
}
