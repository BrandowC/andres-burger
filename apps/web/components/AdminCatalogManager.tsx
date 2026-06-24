"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUploadImage,
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

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const visibleCategories = useMemo(() => {
    return showAllCategories ? categories : categories.slice(0, 4);
  }, [categories, showAllCategories]);

  const visibleProducts = useMemo(() => {
    return showAllProducts ? products : products.slice(0, 6);
  }, [products, showAllProducts]);

  async function loadData() {
    try {
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
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productForm.name.trim()) {
      alert("Escribe el nombre del producto.");
      return;
    }

    if (!productForm.categoryId) {
      alert("Selecciona una categoría.");
      return;
    }

    if (!productForm.price || Number(productForm.price) < 0) {
      alert("Escribe un precio válido.");
      return;
    }

    const body = {
      categoryId: productForm.categoryId,
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      emoji: productForm.emoji.trim(),
      imageUrl: productForm.imageUrl || null,
      isAvailable: productForm.isAvailable,
    };

    try {
      setSavingProduct(true);

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
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleSubmitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      alert("Escribe el nombre de la categoría.");
      return;
    }

    const body = {
      name: categoryForm.name.trim(),
      emoji: categoryForm.emoji.trim(),
      sortOrder: Number(categoryForm.sortOrder || 0),
      isActive: categoryForm.isActive,
    };

    try {
      setSavingCategory(true);

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
    } finally {
      setSavingCategory(false);
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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editCategory(category: AdminCategory) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      emoji: category.emoji || "",
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleProduct(product: AdminProduct) {
    try {
      await apiPatch(`/products/${product.id}`, {
        isAvailable: !product.isAvailable,
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar la disponibilidad del producto.");
    }
  }

  async function deleteProduct(product: AdminProduct) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${product.name}"? Ya no aparecerá en el menú ni en el panel.`,
    );

    if (!confirmed) return;

    try {
      await apiDelete(`/products/${product.id}`);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto.");
    }
  }

  async function deleteCategory(category: AdminCategory) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la categoría "${category.name}"? También se ocultarán sus productos.`,
    );

    if (!confirmed) return;

    try {
      await apiDelete(`/categories/${category.id}`);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la categoría.");
    }
  }

  function cancelProductEdition() {
    setProductForm({
      ...emptyProductForm,
      categoryId: categories[0]?.id || "",
    });
  }

  function cancelCategoryEdition() {
    setCategoryForm(emptyCategoryForm);
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
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleSubmitCategory}
            className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl"
          >
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
              Categorías
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {categoryForm.id ? "Editar categoría" : "Crear categoría"}
            </h2>

            <div className="mt-5 space-y-4">
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm({ ...categoryForm, name: event.target.value })
                }
                placeholder="Nombre de la categoría"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
              />

              <input
                value={categoryForm.emoji}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    emoji: event.target.value,
                  })
                }
                placeholder="Emoji. Ej: 🍔"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
              />

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
                  className="h-5 w-5"
                />
                Categoría activa
              </label>

              <button
                type="submit"
                disabled={savingCategory}
                className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35] shadow-xl shadow-cyan-300/20 disabled:opacity-60"
              >
                {savingCategory
                  ? "Guardando..."
                  : categoryForm.id
                    ? "Guardar categoría"
                    : "Crear categoría"}
              </button>

              {categoryForm.id && (
                <button
                  type="button"
                  onClick={cancelCategoryEdition}
                  className="w-full rounded-2xl bg-slate-200 px-5 py-4 font-black text-[#061a35]"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <section className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                  Lista
                </p>
                <h2 className="mt-1 text-2xl font-black">Categorías</h2>
              </div>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black">
                {categories.length}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {visibleCategories.map((category) => (
                <article
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-black">
                        {category.emoji || "🍽️"} {category.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Orden: {category.sortOrder} ·{" "}
                        {category.isActive ? "Activa" : "Inactiva"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                  </div>
                </article>
              ))}
            </div>

            {categories.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllCategories((value) => !value)}
                className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-[#061a35]"
              >
                {showAllCategories
                  ? "Ver menos categorías"
                  : "Ver más categorías"}
              </button>
            )}
          </section>
        </div>

        <form
          onSubmit={handleSubmitProduct}
          className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl"
        >
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Productos
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {productForm.id ? "Editar producto" : "Crear producto"}
          </h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <input
              value={productForm.name}
              onChange={(event) =>
                setProductForm({ ...productForm, name: event.target.value })
              }
              placeholder="Nombre del producto"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
            />

            <select
              value={productForm.categoryId}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  categoryId: event.target.value,
                })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
            >
              {categories.map((category) => (
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
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
            />

            <input
              value={productForm.emoji}
              onChange={(event) =>
                setProductForm({ ...productForm, emoji: event.target.value })
              }
              placeholder="Emoji. Ej: 🍔"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600"
            />

            <div className="lg:col-span-2">
              <label className="block cursor-pointer rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-600 hover:bg-blue-50">
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
                  {uploadingImage
                    ? "Subiendo imagen..."
                    : "Subir foto o tomar foto"}
                </span>

                <span className="mt-1 block text-sm text-slate-500">
                  En celular abre cámara. En computador abre archivos.
                </span>
              </label>

              {productForm.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productForm.imageUrl}
                    alt="Vista previa del producto"
                    className="h-64 w-full object-cover"
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
              className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-blue-600 lg:col-span-2"
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
                className="h-5 w-5"
              />
              Producto disponible
            </label>

            <button
              type="submit"
              disabled={savingProduct || uploadingImage}
              className="rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35] shadow-xl shadow-cyan-300/20 disabled:opacity-60 lg:col-span-2"
            >
              {savingProduct
                ? "Guardando..."
                : productForm.id
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>

            {productForm.id && (
              <button
                type="button"
                onClick={cancelProductEdition}
                className="rounded-2xl bg-slate-200 px-5 py-4 font-black lg:col-span-2"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
              Catálogo
            </p>

            <h2 className="mt-1 text-2xl font-black">Productos</h2>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-black">
            {products.length} producto{products.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm"
            >
              <div className="flex h-44 items-center justify-center bg-white text-7xl">
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

                <h3 className="mt-1 text-xl font-black">{product.name}</h3>

                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {product.description || "Sin descripción"}
                </p>

                <p className="mt-3 text-2xl font-black text-blue-700">
                  {formatMoney(product.price)}
                </p>

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
                    {product.isAvailable ? "Desactivar" : "Activar"}
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

        {products.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllProducts((value) => !value)}
            className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-[#061a35]"
          >
            {showAllProducts ? "Ver menos productos" : "Ver más productos"}
          </button>
        )}
      </section>
    </div>
  );
}
