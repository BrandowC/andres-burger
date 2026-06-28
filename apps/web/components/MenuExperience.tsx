"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import {
  calculateCartItemSubtotal,
  CartItemAddition,
  useCart,
} from "@/features/cart/cart.store";
import { BusinessMenu, Product } from "@/types/menu";
import {
  CreateOrderDto,
  CreateOrderResponse,
  DeliveryType,
  PaymentMethod,
} from "@/types/order";

type MenuExperienceProps = {
  menu: BusinessMenu;
};

type ReverseGeocodeResponse = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    residential?: string;
    footway?: string;
    path?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
  };
};

export function MenuExperience({ menu }: MenuExperienceProps) {
  const firstCategoryId = menu.categories[0]?.id || "";

  const [activeCategoryId, setActiveCategoryId] = useState(firstCategoryId);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState<
    CartItemAddition[]
  >([]);

  const [cartAnimation, setCartAnimation] = useState(false);
  const [flyingEmoji, setFlyingEmoji] = useState<string | null>(null);

  const {
    items,
    totalItems,
    subtotal,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    updateItemNote,
    clearCart,
  } = useCart();

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

  function scrollToMenuTop() {
    document
      .getElementById("client-menu-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activeCategory = useMemo(() => {
    return menu.categories.find((category) => category.id === activeCategoryId);
  }, [activeCategoryId, menu.categories]);

  function getSafeEmoji(product: Product) {
    if (product.emoji && !product.emoji.includes("�")) {
      return product.emoji;
    }

    const name = product.name.toLowerCase();

    if (name.includes("hamburguesa")) return "🍔";
    if (name.includes("perro")) return "🌭";
    if (name.includes("papita")) return "🍟";
    if (name.includes("salchipapa")) return "🍟";
    if (name.includes("mazorcada")) return "🌽";
    if (name.includes("coca")) return "🥤";
    if (name.includes("postobón")) return "🥤";
    if (name.includes("jugo")) return "🧃";
    if (name.includes("pechuga")) return "🍗";
    if (name.includes("carne")) return "🥩";
    if (name.includes("churrasco")) return "🥩";
    if (name.includes("filete")) return "🥩";

    return "🍽️";
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setSelectedNote("");
    setSelectedAdditions([]);
  }

  function toggleSelectedAddition(addition: BusinessMenu["additions"][number]) {
    setSelectedAdditions((current) => {
      const exists = current.find((item) => item.additionId === addition.id);

      if (exists) {
        return current.filter((item) => item.additionId !== addition.id);
      }

      return [
        ...current,
        {
          additionId: addition.id,
          name: addition.name,
          price: addition.price,
          emoji: addition.emoji,
          quantity: 1,
        },
      ];
    });
  }

  function triggerCartAnimation(emoji: string) {
    setFlyingEmoji(emoji);
    setCartAnimation(true);

    window.setTimeout(() => {
      setFlyingEmoji(null);
    }, 850);

    window.setTimeout(() => {
      setCartAnimation(false);
    }, 600);
  }

  function addSelectedProductToCart() {
    if (!selectedProduct) return;

    const emoji = getSafeEmoji(selectedProduct);

    addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      emoji,
      imageUrl: selectedProduct.imageUrl,
      quantity: selectedQuantity,
      note: selectedNote,
      additions: selectedAdditions,
    });

    triggerCartAnimation(emoji);
    setSelectedProduct(null);
  }

  async function reverseGeocode(lat: number, lon: number, accuracy?: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=es`;

    const response = await fetch(url);
    const data = (await response.json()) as ReverseGeocodeResponse;

    const road =
      data.address?.road ||
      data.address?.pedestrian ||
      data.address?.residential ||
      data.address?.footway ||
      data.address?.path ||
      "";

    const houseNumber = data.address?.house_number || "";

    const detectedAddress = road
      ? houseNumber
        ? `${road} # ${houseNumber}`
        : road
      : data.display_name?.split(",").slice(0, 2).join(",").trim() || "";

    const possibleNeighborhood =
      data.address?.neighbourhood ||
      data.address?.suburb ||
      data.address?.quarter ||
      "";

    const invalidNeighborhood =
      !possibleNeighborhood ||
      possibleNeighborhood.toLowerCase().includes("comuna") ||
      possibleNeighborhood.toLowerCase().includes("municipio") ||
      possibleNeighborhood.toLowerCase().includes("ciudad");

    if (detectedAddress) {
      setAddress(detectedAddress);
    }

    if (!invalidNeighborhood) {
      setNeighborhood(possibleNeighborhood);
    } else {
      setNeighborhood("");
    }

    const roundedAccuracy = accuracy ? Math.round(accuracy) : null;

    if (roundedAccuracy && roundedAccuracy > 80) {
      setGpsStatus(
        `Ubicación detectada, pero la precisión es aproximada (${roundedAccuracy} m). Revisa dirección y escribe el barrio manualmente si hace falta.`,
      );
      return;
    }

    if (!detectedAddress && invalidNeighborhood) {
      setGpsStatus(
        "Ubicación capturada, pero no se pudo detectar dirección ni barrio exactos. Escríbelos manualmente.",
      );
      return;
    }

    if (invalidNeighborhood) {
      setGpsStatus(
        "Dirección detectada. No se detectó barrio exacto, escríbelo manualmente.",
      );
      return;
    }

    setGpsStatus("Dirección detectada. Revisa y corrige si es necesario.");
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("Tu navegador no permite usar GPS.");
      return;
    }

    setGpsStatus("Buscando tu dirección...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        try {
          await reverseGeocode(lat, lon, position.coords.accuracy);
        } catch {
          setGpsStatus(
            "Ubicación capturada, pero no se pudo convertir en dirección. Escríbela manualmente.",
          );
        }
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

  async function handleSubmitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      alert("Agrega productos al carrito.");
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
        alert("Escribe la dirección.");
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
        additions: item.additions.map((addition) => ({
          additionId: addition.additionId,
          quantity: addition.quantity,
        })),
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
      alert("No se pudo crear el pedido. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#061a35] via-[#0A3670] to-[#061a35] pb-32 text-white">
      {flyingEmoji && (
        <div className="fly-to-cart pointer-events-none fixed left-1/2 top-1/2 z-[80] flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl shadow-2xl">
          {flyingEmoji}
        </div>
      )}

      <section
        id="client-menu-top"
        className="relative px-3 pb-8 pt-4 md:px-5 md:pt-6"
      >
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -left-28 top-72 h-96 w-96 rounded-full bg-yellow-200/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <header className="mb-5 text-center md:mb-8">
            <Link
              href="/"
              className="mx-auto inline-flex flex-col items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white text-3xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-20 md:w-20 md:rounded-[1.8rem] md:text-5xl">
                🍔
              </div>

              <h1 className="mt-3 text-2xl font-black leading-none md:text-4xl">
                Andrés Burger
              </h1>

              <p className="mt-1 text-xs font-semibold text-blue-100 md:text-base">
                Pide fácil. Come rico. Sin enredos.
              </p>
            </Link>
          </header>

          <section className="mb-5 rounded-[1.6rem] border border-white/10 bg-white/10 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur md:mb-8 md:rounded-[2rem] md:p-5">
            <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.25em] text-cyan-200 md:text-sm">
              ¿Qué deseas pedir?
            </p>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-6">
              {menu.categories.map((category) => {
                const isActive = category.id === activeCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`rounded-[1rem] px-3 py-2.5 text-left text-xs font-black shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 md:rounded-[1.3rem] md:px-4 md:py-4 md:text-base ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-200 to-white text-[#061a35] ring-4 ring-cyan-300/40"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="block text-lg md:text-2xl">
                      {category.emoji && !category.emoji.includes("�")
                        ? category.emoji
                        : "🍽️"}
                    </span>

                    <span className="mt-1 block leading-tight md:mt-2">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200 md:text-sm">
                Productos
              </p>

              <h2 className="text-3xl font-black md:text-4xl">
                {activeCategory?.name || "Menú"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {activeCategory?.products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[1.3rem] bg-white text-[#061a35] shadow-[0_18px_55px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(0,0,0,0.38)] md:rounded-[2rem]"
                >
                  <div className="p-3 md:p-5">
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="mb-3 flex h-24 w-full items-center justify-center overflow-hidden rounded-[1rem] bg-gradient-to-br from-cyan-50 via-white to-yellow-100 text-5xl shadow-inner transition group-hover:scale-[1.02] md:mb-4 md:h-44 md:rounded-[1.7rem] md:text-8xl"
                    >
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getSafeEmoji(product)
                      )}
                    </button>

                    <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-tight md:min-h-14 md:text-2xl">
                      {product.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-8 text-[11px] font-medium text-slate-500 md:mt-2 md:min-h-12 md:text-base">
                      {product.description || "Producto de Andrés Burger."}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 md:mt-5 md:flex-row md:items-center md:justify-between">
                      <span className="text-lg font-black text-blue-700 md:text-2xl">
                        {formatMoney(product.price)}
                      </span>

                      <button
                        type="button"
                        onClick={() => openProduct(product)}
                        className="rounded-xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 px-3 py-2 text-xs font-black text-[#061a35] shadow-[0_12px_35px_rgba(251,191,36,0.45)] transition hover:scale-105 active:scale-95 md:rounded-[1.2rem] md:px-5 md:py-4 md:text-base"
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-5 md:hidden">
        <div className="relative grid h-[72px] w-full max-w-sm grid-cols-[1fr_92px_1fr] items-center rounded-[2.2rem] border border-white/20 bg-white/90 px-3 shadow-[0_-10px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button
            type="button"
            onClick={scrollToMenuTop}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[#061a35] transition active:scale-95"
            aria-label="Ir al menú"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-[11px] font-black leading-none">Menú</span>
          </button>

          <button
            type="button"
            onClick={scrollToMenuTop}
            className="absolute left-1/2 -top-9 flex h-[82px] w-[82px] -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-[#061a35] bg-gradient-to-br from-white via-cyan-100 to-yellow-100 text-4xl shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition active:scale-95"
            aria-label="Andrés Burger"
          >
            🍔
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[#061a35] transition active:scale-95 ${
              cartAnimation ? "cart-pop" : ""
            }`}
            aria-label="Abrir carrito"
          >
            <span className="text-2xl">🛒</span>
            <span className="text-[11px] font-black leading-none">Carrito</span>

            {totalItems > 0 && (
              <span className="absolute right-4 top-0 flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-300 px-2 text-[11px] font-black text-[#061a35] ring-4 ring-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className={`fixed bottom-6 right-6 z-40 hidden h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-200 to-white text-4xl text-[#061a35] shadow-[0_20px_60px_rgba(34,211,238,0.45)] transition hover:scale-110 active:scale-95 md:flex ${
          cartAnimation ? "cart-pop" : ""
        }`}
      >
        🛒
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow-300 px-2 text-sm font-black text-[#061a35] ring-4 ring-[#061a35]">
            {totalItems}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-0 md:p-6">
          <form
            onSubmit={handleSubmitOrder}
            className="min-h-screen bg-white text-[#061a35] md:mx-auto md:min-h-0 md:max-w-6xl md:rounded-[2rem] md:shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-4 backdrop-blur md:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-700 md:text-sm">
                  Tu pedido
                </p>

                <h2 className="text-2xl font-black md:text-3xl">
                  Finalizar compra
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black md:h-12 md:w-12"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5 p-4 md:p-5 lg:grid-cols-[1fr_420px]">
              <section className="space-y-4">
                {items.length === 0 ? (
                  <div className="rounded-[2rem] bg-slate-50 p-8 text-center md:p-10">
                    <p className="text-5xl md:text-6xl">🛒</p>

                    <h3 className="mt-4 text-2xl font-black md:text-3xl">
                      Tu carrito está vacío
                    </h3>

                    <p className="mt-2 text-slate-500">
                      Agrega productos para hacer tu pedido.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <article
                      key={item.cartItemId}
                      className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 shadow-sm md:rounded-[2rem]"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.3rem] bg-white text-4xl shadow md:h-24 md:w-24 md:rounded-[1.5rem] md:text-5xl">
                          {item.emoji || "🍽️"}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-black md:text-xl">
                            {item.name}
                          </h3>

                          <p className="text-sm font-semibold text-slate-500">
                            {formatMoney(item.price)} base
                          </p>

                          {item.additions.length > 0 && (
                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                              {item.additions.map((addition) => (
                                <p key={addition.additionId}>
                                  {addition.emoji || "➕"} {addition.name} ·{" "}
                                  {formatMoney(addition.price)}
                                </p>
                              ))}
                            </div>
                          )}

                          <p className="mt-2 text-lg font-black text-blue-700 md:text-xl">
                            {formatMoney(calculateCartItemSubtotal(item))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.cartItemId)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-black shadow md:h-11 md:w-11"
                          >
                            -
                          </button>

                          <span className="min-w-8 text-center text-xl font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => incrementItem(item.cartItemId)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-black shadow md:h-11 md:w-11"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-black"
                        >
                          Eliminar
                        </button>
                      </div>

                      <textarea
                        value={item.note || ""}
                        onChange={(event) =>
                          updateItemNote(item.cartItemId, event.target.value)
                        }
                        placeholder="Ej: sin cebolla, sin piña, con salsas aparte..."
                        className="mt-4 min-h-20 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-600 md:text-base"
                      />
                    </article>
                  ))
                )}
              </section>

              <section className="h-fit rounded-[1.6rem] bg-[#061a35] p-4 text-white shadow-2xl md:rounded-[2rem] md:p-5">
                <h3 className="text-xl font-black md:text-2xl">
                  Datos del pedido
                </h3>

                <div className="mt-5 space-y-4">
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                  />

                  <input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Número de celular"
                    className="w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("PICKUP")}
                      className={`rounded-2xl p-4 text-left font-black ${
                        deliveryType === "PICKUP"
                          ? "bg-cyan-200 text-[#061a35]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      🚶 Recoger
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("DELIVERY")}
                      className={`rounded-2xl p-4 text-left font-black ${
                        deliveryType === "DELIVERY"
                          ? "bg-cyan-200 text-[#061a35]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      🏍️ Domicilio
                    </button>
                  </div>

                  {deliveryType === "DELIVERY" && (
                    <div className="space-y-3 rounded-2xl bg-white/10 p-4">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="w-full rounded-2xl bg-cyan-200 px-4 py-4 text-left font-black text-[#061a35]"
                      >
                        📍 Detectar dirección con GPS
                      </button>

                      {gpsStatus && (
                        <p className="text-sm font-medium text-blue-100">
                          {gpsStatus}
                        </p>
                      )}

                      <input
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Dirección"
                        className="w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                      />

                      <input
                        value={neighborhood}
                        onChange={(event) =>
                          setNeighborhood(event.target.value)
                        }
                        placeholder="Barrio"
                        className="w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                      />

                      <input
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="Referencia"
                        className="w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "CASH", label: "💵 Efectivo" },
                      { value: "NEQUI", label: "📲 Nequi" },
                      { value: "BANCOLOMBIA", label: "🏦 Bancolombia" },
                      { value: "QR", label: "🔳 QR" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(method.value as PaymentMethod)
                        }
                        className={`rounded-2xl p-4 text-left font-black ${
                          paymentMethod === method.value
                            ? "bg-cyan-200 text-[#061a35]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                    placeholder="Nota general: sin cebolla, sin piña, salsas aparte..."
                    className="min-h-24 w-full rounded-2xl border border-white/10 bg-white p-4 text-[#061a35] outline-none focus:border-cyan-300"
                  />

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {deliveryType === "DELIVERY" ? "Subtotal" : "Total"}
                      </span>

                      <span className="text-xl font-black md:text-2xl">
                        {formatMoney(subtotal)}
                      </span>
                    </div>

                    {deliveryType === "DELIVERY" && (
                      <p className="mt-2 text-sm text-blue-100">
                        Domicilio y total final por confirmar en WhatsApp.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-200 to-white px-5 py-5 text-lg font-black text-[#061a35] shadow-2xl shadow-cyan-300/30 transition hover:scale-[1.02] disabled:opacity-60"
                  >
                    {loading
                      ? "Creando pedido..."
                      : "Confirmar pedido por WhatsApp"}
                  </button>
                </div>
              </section>
            </div>
          </form>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-0 md:p-6">
          <div className="min-h-screen bg-white text-[#061a35] md:mx-auto md:min-h-0 md:max-w-2xl md:rounded-[2rem] md:shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-4 backdrop-blur md:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-700 md:text-sm">
                  Producto
                </p>

                <h2 className="text-xl font-black md:text-2xl">
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black md:h-12 md:w-12"
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex h-52 items-center justify-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-cyan-50 via-white to-yellow-100 text-7xl md:h-64 md:rounded-[2rem] md:text-8xl">
                {selectedProduct.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getSafeEmoji(selectedProduct)
                )}
              </div>

              <h3 className="mt-5 text-2xl font-black md:text-3xl">
                {selectedProduct.name}
              </h3>

              <p className="mt-2 text-base text-slate-500 md:text-lg">
                {selectedProduct.description || "Producto de Andrés Burger."}
              </p>

              <p className="mt-4 text-2xl font-black text-blue-700 md:text-3xl">
                {formatMoney(selectedProduct.price)}
              </p>

              <section className="mt-6">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                  Cantidad
                </p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQuantity((current) => Math.max(1, current - 1))
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black"
                  >
                    -
                  </button>

                  <span className="text-2xl font-black">
                    {selectedQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQuantity((current) => current + 1)
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black"
                  >
                    +
                  </button>
                </div>
              </section>

              <section className="mt-6">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                  Adiciones
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {menu.additions
                    .filter((addition) => addition.id)
                    .map((addition) => {
                      const selected = selectedAdditions.some(
                        (item) => item.additionId === addition.id,
                      );

                      return (
                        <button
                          key={addition.id}
                          type="button"
                          onClick={() => toggleSelectedAddition(addition)}
                          className={`rounded-2xl border p-4 text-left font-black transition ${
                            selected
                              ? "border-cyan-300 bg-cyan-100 text-[#061a35]"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <span className="block text-xl md:text-2xl">
                            {addition.emoji || "➕"}
                          </span>

                          <span className="mt-2 block">{addition.name}</span>

                          <span className="mt-1 block text-blue-700">
                            {formatMoney(addition.price)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </section>

              <section className="mt-6">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                  Nota del producto
                </p>

                <textarea
                  value={selectedNote}
                  onChange={(event) => setSelectedNote(event.target.value)}
                  placeholder="Ej: sin cebolla, sin piña, con salsas aparte..."
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
                />
              </section>

              <button
                type="button"
                onClick={addSelectedProductToCart}
                className="mt-6 w-full rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 px-5 py-5 text-lg font-black text-[#061a35] shadow-xl shadow-amber-300/40 transition hover:scale-[1.02] active:scale-95"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
