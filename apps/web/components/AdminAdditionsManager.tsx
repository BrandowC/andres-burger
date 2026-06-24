"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { AdminAddition } from "@/types/admin-addition";

type AdditionForm = {
  id?: string;
  name: string;
  price: string;
  emoji: string;
  isActive: boolean;
};

const emptyForm: AdditionForm = {
  name: "",
  price: "",
  emoji: "",
  isActive: true,
};

export function AdminAdditionsManager() {
  const [additions, setAdditions] = useState<AdminAddition[]>([]);
  const [form, setForm] = useState<AdditionForm>(emptyForm);
  const [loading, setLoading] = useState(true);

  async function loadAdditions() {
    try {
      const response = await apiGet<AdminAddition[]>("/additions");
      setAdditions(response);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las adiciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdditions();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Escribe el nombre de la adición.");
      return;
    }

    if (!form.price.trim()) {
      alert("Escribe el precio.");
      return;
    }

    const body = {
      name: form.name,
      price: Number(form.price),
      emoji: form.emoji,
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await apiPatch(`/additions/${form.id}`, body);
      } else {
        await apiPost("/additions", body);
      }

      setForm(emptyForm);
      await loadAdditions();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la adición.");
    }
  }

  function editAddition(addition: AdminAddition) {
    setForm({
      id: addition.id,
      name: addition.name,
      price: String(addition.price),
      emoji: addition.emoji || "",
      isActive: addition.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleAddition(addition: AdminAddition) {
    await apiPatch(`/additions/${addition.id}`, {
      isActive: !addition.isActive,
    });

    await loadAdditions();
  }

  async function deleteAddition(addition: AdminAddition) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${addition.name}"? Ya no aparecerá como adición disponible.`,
    );

    if (!confirmed) return;

    try {
      await apiDelete(`/additions/${addition.id}`);
      await loadAdditions();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la adición.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center text-[#061a35]">
        <p className="text-5xl">➕</p>
        <p className="mt-4 text-xl font-black">Cargando adiciones...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl"
      >
        <h2 className="text-2xl font-black">
          {form.id ? "Editar adición" : "Crear adición"}
        </h2>

        <div className="mt-5 space-y-4">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nombre. Ej: Tocineta"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <input
            value={form.price}
            onChange={(event) =>
              setForm({ ...form, price: event.target.value })
            }
            placeholder="Precio. Ej: 5000"
            type="number"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <input
            value={form.emoji}
            onChange={(event) =>
              setForm({ ...form, emoji: event.target.value })
            }
            placeholder="Emoji. Ej: 🥓"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-600"
          />

          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-black">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
            />
            Adición activa
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-[#061a35]"
          >
            {form.id ? "Guardar cambios" : "Crear adición"}
          </button>

          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="w-full rounded-2xl bg-slate-200 px-5 py-4 font-black"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <section className="rounded-[2rem] bg-white p-5 text-[#061a35] shadow-2xl">
        <h2 className="text-2xl font-black">Adiciones</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {additions.map((addition) => (
            <article
              key={addition.id}
              className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white text-5xl shadow">
                {addition.emoji || "➕"}
              </div>

              <h3 className="mt-4 text-xl font-black">{addition.name}</h3>

              <p className="mt-2 text-2xl font-black text-blue-700">
                {formatMoney(addition.price)}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {addition.isActive ? "Activa" : "Inactiva"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => editAddition(addition)}
                  className="rounded-xl bg-[#061a35] px-4 py-2 text-sm font-black text-white"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => toggleAddition(addition)}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-black"
                >
                  {addition.isActive ? "Desactivar" : "Activar"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAddition(addition)}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
