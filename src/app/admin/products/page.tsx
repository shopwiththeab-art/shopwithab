"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Product = {
  id: string; name: string; category: string; description: string;
  price: number; sizes: string[]; image: string; in_stock: boolean; quantity: number; featured: boolean;
};

const DEFAULT_CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Accessories"];

type FormState = {
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  in_stock: boolean;
  quantity: string;
  featured: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState<FormState>({
    name: "",
    category: "Tops",
    description: "",
    price: "",
    image: "/products/placeholder.jpg",
    in_stock: true,
    quantity: "0",
    featured: false
  });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");

  const resetForm = () => {
    setForm({
      name: "",
      category: "Tops",
      description: "",
      price: "",
      image: "/products/placeholder.jpg",
      in_stock: true,
      quantity: "0",
      featured: false
    });
  };

  // Collect all unique categories
  const availableCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])
  );

  const load = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
    if (initial) setLoading(false);
  };

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const openAdd = () => {
    resetForm();
    setEditing(null);
    setMsg(null);
    setModal("add");
    setCustomCategory("");
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    const isDefaultOrExisting = DEFAULT_CATEGORIES.includes(p.category) || products.some(pr => pr.category === p.category);
    setForm({ name: p.name, category: p.category, description: p.description || "", price: String(p.price), image: p.image, in_stock: p.in_stock, quantity: String(p.quantity ?? 0), featured: p.featured ?? false });
    setMsg(null);
    setModal("edit");
    setCustomCategory("");
  };
  const close = () => {
    setModal(null);
    setEditing(null);
    setMsg(null);
    setCustomCategory("");
  };
  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = form.category === "__custom__" ? customCategory.trim() : form.category;
    if (!finalCategory) {
      setMsg({ text: "Please specify a category.", ok: false });
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...(editing ? { id: editing.id } : {
        id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
      }),
      name: form.name,
      category: finalCategory,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      quantity: Number((form as any).quantity ?? 0),
      featured: (form as any).featured ?? false,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    };

    const res = await fetch("/api/admin/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      setMsg({ text: data.error || "Failed to save.", ok: false });
    } else {
      setMsg({ text: editing ? "Product updated." : "Product added.", ok: true });
      load();
      setTimeout(close, 1500);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeleting(id);
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg({ text: data.error || "Delete failed. Try again.", ok: false });
    }
    load();
  };

  const cancelDelete = () => setDeleteConfirmId(null);

  const handleToggleStock = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, in_stock: !p.in_stock }),
    });
    load();
  };

  const inp = "w-full bg-white/5 border border-white/10 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Products</h1>
          <p className="text-xs text-white/30 mt-0.5">
            {loading ? "Loading…" : (
              <>
                {products.filter(p => p.in_stock).length} active
                {" · "}{products.filter(p => !p.in_stock).length} out of stock
                {" · "}{products.reduce((sum, p) => sum + (p.quantity ?? 0), 0)} total units
              </>
            )}
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 hover:bg-white/90 transition-colors flex items-center gap-2">
          <span>+</span> Add Product
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-white animate-pulse border border-slate-200 rounded-lg shadow-sm" />)}
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length === 0 && (
        <div className="border border-slate-200 bg-white rounded-lg py-20 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No products yet</p>
          <button onClick={openAdd} className="bg-slate-900 text-white text-xs font-bold tracking-widest uppercase px-8 py-3 hover:bg-slate-800 transition-colors rounded">
            Add First Product
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className={`bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${!p.in_stock ? "opacity-60" : ""}`}>
              <div className="relative h-44 bg-slate-50 border-b border-slate-100 overflow-hidden">
                <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                  onError={() => {}} />
                <span className={`absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 border rounded ${
                  p.in_stock 
                    ? "bg-emerald-50 border-emerald-250 text-emerald-700" 
                    : "bg-rose-50 border-rose-250 text-rose-700"
                }`}>
                  {p.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[9px] tracking-widest uppercase text-white/30 mb-1">{p.category}</p>
                <p className="text-sm font-semibold text-white/85 mb-1 truncate">{p.name}</p>
                <p className="text-xs text-white/60 font-medium">GHS {p.price}</p>
                <div className="flex items-center gap-3 mt-1 mb-4">
                  <p className="text-[9px] text-white/30">
                    <span className="text-white/60 font-semibold">{p.quantity ?? 0}</span> units in stock
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 text-[9px] font-bold tracking-widest uppercase py-2 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all rounded">
                    ✎ Edit
                  </button>
                  <button onClick={() => handleToggleStock(p)}
                    className="flex-1 text-[9px] font-bold tracking-widest uppercase py-2 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all rounded">
                    {p.in_stock ? "Mark OOS" : "Restock"}
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    className="text-[9px] tracking-widest uppercase px-3 py-2 border border-red-200 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all flex items-center justify-center gap-1 font-bold rounded">
                    {deleting === p.id ? "…" : "✕ Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-[#0a0a0a] border border-white/10 p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/30">
                {modal === "add" ? "Add New Product" : `Edit — ${editing?.name}`}
              </p>
              <button onClick={close} className="text-white/30 hover:text-white">✕</button>
            </div>

            {msg && (
              <p className={`text-xs mb-4 flex items-center gap-2 ${msg.ok ? "text-green-400" : "text-red-400"}`}>
                {msg.ok ? "✓" : "✕"} {msg.text}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: "Product Name", key: "name", type: "text", placeholder: "e.g. Series 02 Tee" },
                { label: "Price (GHS)", key: "price", type: "number", placeholder: "e.g. 155" },
                { label: "Stock Quantity", key: "quantity", type: "number", placeholder: "e.g. 50" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setF(f.key, e.target.value)} className={inp} />
                </div>
              ))}

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Product Image Attachment</label>
                {form.image && form.image !== "/products/placeholder.jpg" && (
                  <div className="mb-3 border border-white/10 bg-[#0d0d0d] overflow-hidden" style={{ aspectRatio: "4/5", width: "100%" }}>
                    <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="relative bg-white/5 border border-white/10 text-white text-xs px-4 py-3 hover:border-white/20 transition-colors flex items-center justify-between cursor-pointer">
                  <span className="text-white/40 truncate">{form.image && form.image !== "/products/placeholder.jpg" ? "Change Image" : "Upload / Attach Image"}</span>
                  <span className="text-white/20 text-[9px] uppercase tracking-widest">Auto-Fit</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const src = reader.result as string;
                        const img = new window.Image();
                        img.onload = () => {
                          // Canvas target: 800×1000 (4:5) with 8% padding on each side
                          const W = 800, H = 1000;
                          const pad = 0.08;
                          const maxW = W * (1 - pad * 2);
                          const maxH = H * (1 - pad * 2);
                          const scale = Math.min(maxW / img.width, maxH / img.height);
                          const dw = img.width * scale;
                          const dh = img.height * scale;
                          const dx = (W - dw) / 2;
                          const dy = (H - dh) / 2;
                          const canvas = document.createElement("canvas");
                          canvas.width = W;
                          canvas.height = H;
                          const ctx = canvas.getContext("2d")!;
                          ctx.fillStyle = "#0a0a0a";
                          ctx.fillRect(0, 0, W, H);
                          ctx.drawImage(img, dx, dy, dw, dh);
                          setF("image", canvas.toDataURL("image/jpeg", 0.92));
                        };
                        img.src = src;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={3}
                  className={inp + " resize-none"} placeholder="Short product description" />
              </div>

              <div>
                <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Category</label>
                <div className="relative w-full">
                  <select
                    value={form.category}
                    onChange={e => setF("category", e.target.value)}
                    className={inp + " appearance-none cursor-pointer pr-10"}
                  >
                    {availableCategories.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                    <option value="__custom__" className="bg-[#111] font-bold text-[#ff2a85]">+ Add Custom Category...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {form.category === "__custom__" && (
                <div>
                  <label className="block text-[9px] tracking-widests uppercase text-white/30 mb-1.5">Custom Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accessories"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className={inp}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setF("in_stock", !form.in_stock)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.in_stock ? "bg-green-500" : "bg-white/10"}`}>
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: form.in_stock ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
                <span className="text-xs text-white/40">{form.in_stock ? "In Stock" : "Out of Stock"}</span>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setF("featured", !(form as any).featured)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${(form as any).featured ? "bg-amber-500" : "bg-white/10"}`}>
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: (form as any).featured ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
                <span className="text-xs text-white/40">{(form as any).featured ? "⭐ Featured on Homepage" : "Not Featured"}</span>
              </div>

              <div className="flex gap-3 pt-4 flex-col">
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-white text-black text-xs font-bold tracking-widests uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving…</> : (modal === "add" ? "Add Product" : "Save Changes")}
                  </button>
                  <button type="button" onClick={close}
                    className="px-5 border border-white/10 text-white/40 hover:text-white text-xs uppercase tracking-widests transition-colors">
                    Cancel
                  </button>
                </div>
                {modal === "edit" && editing && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editing.id);
                      close();
                    }}
                    disabled={deleting === editing.id}
                    className="w-full bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-xs font-bold tracking-widests uppercase py-3 transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting === editing.id ? "Deleting…" : "🗑 Delete Product"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={cancelDelete}>
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-base">🗑</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Delete Product?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {products.find(p => p.id === deleteConfirmId)?.name ?? "This product"} will be permanently removed.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deleting}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold tracking-widest uppercase hover:bg-red-700 active:bg-red-800 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>
                ) : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
