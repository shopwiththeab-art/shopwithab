"use client";

import { useEffect, useState } from "react";

type Status = "All" | "Pending" | "Processing" | "Shipped" | "In Transit" | "Delivered" | "Cancelled";

type OrderItem = {
  name: string;
  qty: number;
  price: number;
  size?: string;
  image?: string;
};

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: string;
  tracking_number?: string;
  shipping_fee?: number;
  created_at: string;
};

const STATUS_OPTIONS: Status[] = ["All", "Pending", "Processing", "Shipped", "In Transit", "Delivered", "Cancelled"];

const EDIT_STATUSES = ["Pending", "Processing", "Shipped", "In Transit", "Delivered", "Cancelled"];

const statusColor: Record<string, string> = {
  Delivered:    "bg-green-500/15 text-green-400 border border-green-500/30",
  "In Transit": "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  Shipped:      "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  Processing:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  Pending:      "bg-white/8 text-white/60 border border-white/15",
  Cancelled:    "bg-red-500/15 text-red-400 border border-red-500/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === "All" || o.status === filter;
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedOrder = orders.find(o => o.id === selected);

  const openEdit = (o: Order) => {
    setSelected(o.id);
    setNewStatus(o.status);
    setTrackingNum(o.tracking_number || "");
    setShippingFee(o.shipping_fee ? String(o.shipping_fee) : "");
    setSaveMsg("");
  };

  const applyStatus = async () => {
    if (!selected || !newStatus) return;
    setSaving(true);
    setSaveMsg("");
    const body: Record<string, string | number> = { id: selected, status: newStatus };
    if (newStatus === "Shipped") {
      if (trackingNum.trim()) body.tracking_number = trackingNum.trim();
      if (shippingFee.trim()) body.shipping_fee = Number(shippingFee.trim());
    }
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o =>
        o.id === selected
          ? { 
              ...o, 
              status: newStatus, 
              tracking_number: body.tracking_number as string ?? o.tracking_number,
              shipping_fee: body.shipping_fee as number ?? o.shipping_fee
            }
          : o
      ));
      setSaveMsg("✓ Updated successfully");
      setTimeout(() => { setSelected(null); setTrackingNum(""); setSaveMsg(""); }, 1000);
    } else {
      setSaveMsg("Failed to update. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Orders</h1>
          <p className="text-xs text-white/30 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-[9px] tracking-[0.2em] uppercase px-3 py-2 border transition-all rounded-sm
                ${filter === s ? "border-white bg-white text-black" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by order ID, name or email…"
        className="w-full bg-white/5 border border-white/8 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />

      <div className="bg-white/[0.03] border border-white/5 rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/25 text-xs tracking-widest uppercase animate-pulse">Loading orders…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order ID", "Customer", "Email", "Items", "Amount", "Status", "Tracking", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[9px] tracking-widest uppercase text-white/20 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-white/55 text-[11px]">{o.id}</td>
                    <td className="px-4 py-3.5 text-white/75 font-medium">{o.customer_name}</td>
                    <td className="px-4 py-3.5 text-white/40">{o.customer_email}</td>
                    <td className="px-4 py-3.5 text-white/50 text-center">{o.items?.length || 0}</td>
                    <td className="px-4 py-3.5 text-white/65 font-medium">{o.currency} {Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${statusColor[o.status] || "bg-white/8 text-white/40"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-white/35 text-[10px]">
                      {o.tracking_number || <span className="text-white/15">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-white/30">
                      {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 flex items-center gap-1.5">
                      <button onClick={() => setViewingOrder(o)}
                        className="text-[9px] tracking-widest uppercase bg-white/5 hover:bg-white/15 text-white/90 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 transition-all rounded-sm flex items-center gap-1">
                        <svg className="w-3 h-3 text-[#ff2a85]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                      <button onClick={() => openEdit(o)}
                        className="text-[9px] tracking-widest uppercase text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 transition-all rounded-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-white/25 text-xs tracking-widest uppercase">No orders found</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0a0a0a] border border-white/10 p-8 w-full max-w-md rounded-sm" onClick={e => e.stopPropagation()}>
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-6">Edit Order</p>

            {/* Order info */}
            <div className="space-y-3 mb-6 text-xs">
              {[
                ["Order",    selectedOrder.id],
                ["Customer", selectedOrder.customer_name],
                ["Email",    selectedOrder.customer_email],
                ["Phone",    selectedOrder.customer_phone],
                ["Amount",   `${selectedOrder.currency} ${Number(selectedOrder.total).toFixed(2)}`],
                ["Address",  `${selectedOrder.shipping_address}, ${selectedOrder.shipping_city}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/40">{label}</span>
                  <span className="font-mono text-white/70 text-right max-w-[220px] truncate">{val}</span>
                </div>
              ))}
            </div>

            {/* Status dropdown */}
            <div className="mb-4">
              <label className="block text-[9px] tracking-widest uppercase text-white/30 mb-2">Status</label>
              <div className="relative w-full">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-xs px-4 py-3 focus:outline-none focus:border-white/25 appearance-none cursor-pointer pr-10"
                >
                  {EDIT_STATUSES.map(s => (
                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tracking number & Shipping Fee — only when Shipped */}
            {newStatus === "Shipped" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-cyan-400/60 mb-2">
                    Tracking Number <span className="text-white/30">(sent to customer)</span>
                  </label>
                  <input
                    type="text"
                    value={trackingNum}
                    onChange={e => setTrackingNum(e.target.value)}
                    placeholder="e.g. GH123456789"
                    className="w-full bg-white/5 border border-cyan-500/20 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
                  />
                  <p className="text-[10px] text-white/20 mt-1.5">Customer will see this on their Orders page.</p>
                </div>
                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-cyan-400/60 mb-2">
                    Shipping Fee (GHS) <span className="text-white/30">(Added to total)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingFee}
                    onChange={e => setShippingFee(e.target.value)}
                    placeholder="e.g. 50.00"
                    className="w-full bg-white/5 border border-cyan-500/20 text-white text-xs px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* No tracking field for other statuses — but show existing tracking if set */}
            {newStatus !== "Shipped" && selectedOrder.tracking_number && (
              <div className="mb-6 bg-white/[0.03] border border-white/5 px-4 py-3 text-xs">
                <span className="text-white/30">Existing tracking: </span>
                <span className="font-mono text-white/60">{selectedOrder.tracking_number}</span>
              </div>
            )}

            {saveMsg && (
              <p className={`text-xs mb-4 ${saveMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{saveMsg}</p>
            )}

            <div className="flex gap-3">
              <button onClick={applyStatus} disabled={saving}
                className="flex-1 bg-white text-black text-xs font-bold tracking-widest uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                Update Status
              </button>
              <button onClick={() => setSelected(null)} className="px-5 border border-white/10 text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
          <div className="bg-[#0c0c0c] border border-white/15 p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ff2a85] font-bold mb-1">Order Summary & Items</p>
                <h3 className="font-mono text-xl font-black text-white">{viewingOrder.id}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm ${statusColor[viewingOrder.status] || "bg-white/10 text-white"}`}>
                  {viewingOrder.status}
                </span>
                <button onClick={() => setViewingOrder(null)} className="text-white/40 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Customer & Shipping Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] border border-white/8 p-4.5 rounded-sm mb-6 text-xs">
              <div>
                <p className="text-[9px] tracking-widest uppercase text-white/30 mb-1.5 font-bold">Customer Details</p>
                <p className="font-bold text-white text-sm">{viewingOrder.customer_name}</p>
                <p className="text-white/60 mt-0.5">{viewingOrder.customer_email}</p>
                <p className="text-white/60 font-mono mt-0.5">{viewingOrder.customer_phone || "No phone provided"}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase text-white/30 mb-1.5 font-bold">Shipping Address</p>
                <p className="text-white/85 leading-relaxed">{viewingOrder.shipping_address || "No street address"}</p>
                <p className="text-white/60 mt-0.5">{viewingOrder.shipping_city || ""}</p>
                {viewingOrder.tracking_number && (
                  <p className="mt-2 text-cyan-400 font-mono text-[11px]">📦 Tracking: {viewingOrder.tracking_number}</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/40 font-bold mb-3">Order Items ({viewingOrder.items?.length || 0})</p>
              <div className="space-y-2.5">
                {(viewingOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/8 rounded-sm transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-sm bg-white/5 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-white/30 uppercase tracking-tighter">No Img</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wide">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/50 font-medium">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase text-white/80">Size: {item.size || "M"}</span>
                          <span>Qty: <strong className="text-white font-mono">{item.qty}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Price</p>
                      <p className="text-sm font-mono font-bold text-white mt-0.5">
                        {viewingOrder.currency} {(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-sm">
              <div className="text-xs space-y-1">
                <p className="text-white/50">Date Placed: <span className="text-white/80">{new Date(viewingOrder.created_at).toLocaleString("en-GB")}</span></p>
                {viewingOrder.shipping_fee !== undefined && viewingOrder.shipping_fee !== null && (
                  <p className="text-amber-400/80">Delivery Fee Added: <span className="font-mono font-bold">GHS {viewingOrder.shipping_fee.toFixed(2)}</span></p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-widest uppercase text-white/40">Total Amount</p>
                <p className="text-2xl font-black font-mono text-[#ff2a85] mt-0.5">
                  {viewingOrder.currency} {Number(viewingOrder.total).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingOrder(null)} className="bg-white text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded-sm hover:bg-white/90 transition-colors">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
