"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type OrderResult = {
  id: string; status: string; created_at: string; total: number; currency: string;
  items: { name: string; qty: number; size: string }[];
  shipping_address: string; shipping_city: string;
  tracking_number?: string;
  shipping_fee?: number;
};

const STATUS_STEPS = ["Processing", "Shipped", "In Transit", "Delivered"];

const statusColor: Record<string, string> = {
  Delivered:    "bg-green-50 text-green-700 font-semibold",
  "In Transit": "bg-blue-50 text-blue-700 font-semibold",
  Shipped:      "bg-cyan-50 text-cyan-700 font-semibold",
  Processing:   "bg-amber-50 text-amber-700 font-semibold",
  Pending:      "bg-black/5 text-black/40 font-semibold",
  Cancelled:    "bg-red-50 text-red-700 font-semibold",
};

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [result, setResult] = useState<OrderResult | null | "not-found">(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(orderNum.trim().toUpperCase())}`);
      const data = await res.json();
      setResult(data.error || !data.id ? "not-found" : data);
    } catch {
      setResult("not-found");
    }
    setLoading(false);
  };

  const order = result && result !== "not-found" ? result : null;
  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28 pb-16 md:pb-24 text-[#050505]">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[9px] tracking-[0.35em] uppercase text-black/35 mb-3 font-bold">Logistics</p>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-black/90 uppercase mb-4">Track Order</h1>
          <p className="text-sm text-black/50 mb-8 md:mb-12 leading-relaxed">
            Enter your order number from your confirmation email.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-10 md:mb-12">
            <input
              type="text" value={orderNum} onChange={e => setOrderNum(e.target.value)}
              placeholder="AB-000000" required
              className="flex-1 bg-[#fff5f7] border border-black/10 text-black text-sm px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors font-mono"
            />
            <button type="submit" disabled={loading}
              className="bg-black text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-neutral-800 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-2 justify-center">
              {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Tracking…</> : "Track"}
            </button>
          </form>

          {result === "not-found" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border border-red-500/20 bg-red-50 p-6 text-center">
              <p className="text-xs text-red-600 tracking-widest uppercase font-semibold">Order not found</p>
              <p className="text-xs text-black/50 mt-2">Check your confirmation email and try again.</p>
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border border-black/5 bg-[#fff5f7] p-6">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-1 font-bold">Order</p>
                  <p className="text-lg font-mono font-bold text-black/90">{order.id}</p>
                  <p className="text-[10px] text-black/40 mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-2 font-bold">Status</p>
                  <span className={`text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm ${statusColor[order.status] || "bg-black/5 text-black/45"}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="border border-black/5 p-6 bg-[#fff5f7]">
                <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-8 font-bold">Shipment Progress</p>
                <div className="relative">
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-black/10" />
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const done = stepIndex >= i;
                      const current = stepIndex === i;
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 z-10 transition-colors ${
                            done ? "bg-[#ff2a85]" : "bg-black/5 border border-black/10"
                          } ${current ? "ring-2 ring-[#ff2a85]/20 ring-offset-2 ring-offset-white" : ""}`} />
                          <p className={`text-xs tracking-widest uppercase ${done ? "text-black/85 font-medium" : "text-black/30"}`}>{step}</p>
                          {current && <span className="text-[9px] text-[#ff2a85]/70 tracking-widest uppercase ml-auto font-bold">Current</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>              {/* Tracking Number — shown when set */}
              {order.tracking_number && (
                <div className="border border-cyan-200 bg-cyan-50 p-6 text-[#050505]">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-cyan-800 mb-3 font-bold">📦 Tracking Number</p>
                  <p className="text-2xl font-mono font-black text-cyan-700 tracking-wider mb-2">{order.tracking_number}</p>
                  <p className="text-[10px] text-black/50 leading-relaxed">
                    Use this number on your courier&apos;s website to track your shipment in real time.
                  </p>
                </div>
              )}

              {/* Items + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-black/5 bg-[#fff5f7] p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-4 font-bold">Items</p>
                  <ul className="space-y-3">
                    {order.items?.map((item: any, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-xs border-b border-black/5 pb-3 last:border-0 last:pb-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover object-center rounded-sm border border-black/10 flex-shrink-0 bg-black/5"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-black/90 font-bold">{item.name}</p>
                          <p className="text-black/50 mt-0.5">{item.size} × {item.qty}</p>
                        </div>
                        {item.price !== undefined && item.price !== null && (
                          <span className="font-semibold text-black/80">GHS {(Number(item.price) * (item.qty || 1)).toFixed(2)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-black/10 space-y-1">
                    <p className="text-xs text-black/50 flex justify-between">
                      <span>Total Paid (excl. shipping)</span>
                      <span className="font-semibold text-black">{order.currency} {Number(order.total).toFixed(2)}</span>
                    </p>
                    {order.shipping_fee !== undefined && order.shipping_fee !== null && (
                      <p className="text-xs text-amber-700 font-bold flex justify-between">
                        <span className="uppercase tracking-widest text-[9px]">Shipping Fee</span>
                        <span>{order.currency} {Number(order.shipping_fee).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="border border-black/5 bg-[#fff5f7] p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-4 font-bold">Shipping To</p>
                  <p className="text-xs text-black/70 leading-relaxed font-medium">{order.shipping_address}</p>
                  <p className="text-xs text-black/50 mt-1">{order.shipping_city}</p>
                </div>
              </div>

              <Link href="/store"
                className="block text-center border border-black/25 text-xs tracking-widest uppercase py-4 text-black/60 hover:bg-black hover:text-white transition-all font-semibold">
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
