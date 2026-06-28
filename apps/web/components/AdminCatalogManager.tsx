"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiGet,
  apiPatch,
  apiPost,
  apiUploadImage,
  apiDelete,
} from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { AdminCategory, AdminProduct } from "@/types/admin-catalog";

type ProductForm = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  emoji: string;
  imageUrl: string;
  isAvailable: boolean;
};

type CategoryForm = {
  id?: string;
  name: string;
  emoji: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyProductForm: ProductForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  emoji: "",
  imageUrl: "",
  isAvailable: true,
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  emoji: "",
  sortOrder: "0",
  isActive: true,
};

export function AdminCatalogManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [selectedCatalogCategoryId, setSelectedCatalogCategoryId] =
    useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function loadData() {
    const [productsResponse, categoriesResponse] = await Promise.all([
      apiGet<AdminProduct[]>("/products"),
      apiGet<AdminCategory[]>("/categories"),
    ]);

    setProducts(productsResponse);
    setCategories(categoriesResponse);

    if (!productForm.categoryId && categoriesResponse[0]) {
      setProductForm((current) => ({
        ...current,
        categoryId: categoriesResponse[0].id,
      }));
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCatalogCategoryId === "all") {
      return products;
    }

    return products.filter(
      (product) => product.categoryId === selectedCatalogCategoryId,
    );
  }, [products, selectedCatalogCategoryId]);

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.isActive);
  }, [categories]);

  async function handleUploadProductImage(file?: File) {
    if (!file) return;

    try {
      setUploadingImage(true);

      const response = await apiUploadImage(file);

      setProductForm((current) => ({
        ...current,
        imageUrl: response.url,
      }));
    } catch (error) {
      console.error(error);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      alert("Escribe el nombre de la categoría.");
      return;
    }

    const body = {
      name: categoryForm.name,
      emoji: categoryForm.emoji,
      sortOrder: Number(categoryForm.sortOrder),
      isActive: categoryForm.isActive,
    };

    try {
      if (categoryForm.id) {
        await apiPatch(`/categories/${categoryForm.id}`, body);
      } else {
        await apiPost("/categories", body);
      }

      setCategoryForm(emptyCategoryForm);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la categoría.");
    }
  }

  async function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productForm.categoryId) {
      alert("Selecciona una categoría.");
      return;
    }

    if (!productForm.name.trim()) {
      alert("Escribe el nombre del producto.");
      return;
    }

    if (!productForm.price.trim()) {
      alert("Escribe el precio del producto.");
      return;
    }

    const body = {
      categoryId: productForm.categoryId,
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      emoji: productForm.emoji,
      imageUrl: productForm.imageUrl || null,
      isAvailable: productForm.isAvailable,
    };

    try {
      if (productForm.id) {
        await apiPatch(`/products/${productForm.id}`, body);
      } else {
        await apiPost("/products", body);
      }

      setProductForm({
        ...emptyProductForm,
        categoryId: categories[0]?.id || "",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto.");
    }
  }

  function editCategory(category: AdminCategory) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      emoji: category.emoji || "",
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });
  }

  async function deleteCategory(category: AdminCategory) {
    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar definitivamente la categoría "${category.name}"? Si tiene productos, también se eliminarán del catálogo. Los pedidos históricos no se borran.`,
    );

    if (!confirmDelete) return;

    try {
      await apiDelete(`/categories/${category.id}`);

      if (selectedCatalogCategoryId === category.id) {
        setSelectedCatalogCategoryId("all");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la categoría.");
    }
  }

  function editProduct(product: AdminProduct) {
    setProductForm({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      emoji: product.emoji || "",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable,
    });

    setSelectedCatalogCategoryId(product.categoryId);
  }

  async function deleteProduct(product: AdminProduct) {
    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar definitivamente el producto "${product.name}"? Los pedidos históricos no se borran.`,
    );

    if (!confirmDelete) return;

    try {
      await apiDelete(`/products/${product.id}`);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto.");
    }
  }

  async function toggleProduct(product: AdminProduct) {
    try {
      await apiPatch(`/products/${product.id}`, {
        isAvailable: !product.isAvailable,
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar la disponibilidad.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center text-[#061a35]">
        <p className="text-5xl">🍔</p>
        <p className="mt-4 text-xl font-black">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-[2rem] bg-white p-4 text-[#061a35] shadow-2xl md:p-5">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Categorías
          </p>

          <h2 className="mt-1 text-2xl font-black">
            {categoryForm.id ? "Editar categoría" : "Crear categoría"}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Organiza las secciones del menú. Estas categorías controlan cómo ve
            el cliente el catálogo.
          </p>
        </div>

        <form onSubmit={handleSubmitCategory} className="space-y-3">
          <input
            value={categoryForm.name}
            onChange={(event) =>
              setCategoryForm({ ...categoryForm, name: event.target.value })
            }
            placeholder="Nombre de la categoría"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <div className="grid grid-cols-[1fr_110px] gap-3">
            <input
              value={categoryForm.emoji}
              onChange={(event) =>
                setCategoryForm({ ...categoryForm, emoji: event.target.value })
              }
              placeholder="Emoji"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
            />

            <input
              value={categoryForm.sortOrder}
              onChange={(event) =>
                setCategoryForm({
                  ...categoryForm,
                  sortOrder: event.target.value,
                })
              }
              placeholder="Orden"
              type="number"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-black">
            <input
              type="checkbox"
              checked={categoryForm.isActive}
              onChange={(event) =>
                setCategoryForm({
                  ...categoryForm,
                  isActive: event.target.checked,
                })
              }
            />
            Categoría activa
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className="rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35] shadow-xl"
            >
              {categoryForm.id ? "Guardar" : "Crear"}
            </button>

            {categoryForm.id ? (
              <button
                type="button"
                onClick={() => setCategoryForm(emptyCategoryForm)}
                className="rounded-2xl bg-slate-200 px-5 py-4 text-lg font-black"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCategoryForm(emptyCategoryForm)}
                className="rounded-2xl bg-slate-100 px-5 py-4 text-lg font-black text-slate-500"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-black">Mis categorías</h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black">
              {categories.length}
            </span>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className={`rounded-2xl border p-4 ${
                  category.isActive
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-slate-100 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-lg font-black">
                      <span className="mr-2">{category.emoji || "🍽️"}</span>
                      {category.name}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Orden: {category.sortOrder} ·{" "}
                      {category.isActive ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editCategory(category)}
                    className="rounded-xl bg-[#061a35] px-4 py-2 text-sm font-black text-white"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCategory(category)}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-4 text-[#061a35] shadow-2xl md:p-5">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Productos
          </p>

          <h2 className="mt-1 text-2xl font-black">
            {productForm.id ? "Editar producto" : "Crear producto"}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Crea productos, cambia fotos, modifica precios y revisa el catálogo
            filtrado por categoría.
          </p>
        </div>

        <form
          onSubmit={handleSubmitProduct}
          className="grid gap-4 lg:grid-cols-2"
        >
          <input
            value={productForm.name}
            onChange={(event) =>
              setProductForm({ ...productForm, name: event.target.value })
            }
            placeholder="Nombre del producto"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <select
            value={productForm.categoryId}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                categoryId: event.target.value,
              })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          >
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>

          <input
            value={productForm.price}
            onChange={(event) =>
              setProductForm({ ...productForm, price: event.target.value })
            }
            placeholder="Precio. Ej: 25000"
            type="number"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <input
            value={productForm.emoji}
            onChange={(event) =>
              setProductForm({ ...productForm, emoji: event.target.value })
            }
            placeholder="Emoji. Ej: 🍔"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <div className="lg:col-span-2">
            <label className="block cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-cyan-300 hover:bg-cyan-50">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) =>
                  handleUploadProductImage(event.target.files?.[0])
                }
              />

              <span className="block text-5xl">📸</span>

              <span className="mt-3 block text-lg font-black">
                {uploadingImage ? "Subiendo imagen..." : "Subir o tomar foto"}
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                En celular abre la cámara. En computador abre archivos.
              </span>
            </label>

            {productForm.imageUrl && (
              <div className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productForm.imageUrl}
                  alt="Vista previa"
                  className="h-60 w-full object-cover"
                />
              </div>
            )}
          </div>

          <textarea
            value={productForm.description}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                description: event.target.value,
              })
            }
            placeholder="Descripción del producto"
            className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600 lg:col-span-2"
          />

          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-black lg:col-span-2">
            <input
              type="checkbox"
              checked={productForm.isAvailable}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  isAvailable: event.target.checked,
                })
              }
            />
            Producto disponible
          </label>

          <div className="grid gap-3 lg:col-span-2 sm:grid-cols-2">
            <button
              type="submit"
              className="rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35] shadow-xl"
            >
              {productForm.id ? "Guardar producto" : "Crear producto"}
            </button>

            {productForm.id ? (
              <button
                type="button"
                onClick={() =>
                  setProductForm({
                    ...emptyProductForm,
                    categoryId: categories[0]?.id || "",
                  })
                }
                className="rounded-2xl bg-slate-200 px-5 py-4 text-lg font-black"
              >
                Cancelar edición
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setProductForm({
                    ...emptyProductForm,
                    categoryId: categories[0]?.id || "",
                  })
                }
                className="rounded-2xl bg-slate-100 px-5 py-4 text-lg font-black text-slate-500"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                Catálogo
              </p>

              <h3 className="mt-1 text-2xl font-black">
                Productos por categoría
              </h3>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-black">
              {filteredProducts.length} producto
              {filteredProducts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCatalogCategoryId("all")}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                selectedCatalogCategoryId === "all"
                  ? "bg-cyan-300 text-[#061a35]"
                  : "bg-slate-100 text-[#061a35] hover:bg-slate-200"
              }`}
            >
              Todos
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCatalogCategoryId(category.id)}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  selectedCatalogCategoryId === category.id
                    ? "bg-cyan-300 text-[#061a35]"
                    : "bg-slate-100 text-[#061a35] hover:bg-slate-200"
                }`}
              >
                {category.emoji || "🍽️"} {category.name}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] bg-slate-50 p-8 text-center">
              <p className="text-5xl">📦</p>
              <h4 className="mt-4 text-2xl font-black">Sin productos</h4>
              <p className="mt-2 text-slate-500">
                Esta categoría todavía no tiene productos registrados.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 ${
                    product.isAvailable ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex h-40 items-center justify-center bg-white text-7xl">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      product.emoji || "🍽️"
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                      {product.category?.name}
                    </p>

                    <h4 className="mt-1 text-xl font-black">{product.name}</h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {product.description || "Sin descripción"}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xl font-black text-blue-700">
                        {formatMoney(product.price)}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          product.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.isAvailable ? "Disponible" : "Oculto"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className="rounded-xl bg-[#061a35] px-4 py-2 text-sm font-black text-white"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-black"
                      >
                        {product.isAvailable ? "Ocultar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
