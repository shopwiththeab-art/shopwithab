"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import PaymentForm from "@/components/PaymentForm";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { createClient } from "@/utils/supabase/client";

type Stage = "shipping" | "payment" | "awaiting" | "processing" | "success" | "failed";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [stage, setStage]       = useState<Stage>("shipping");
  const [orderNum, setOrderNum] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [momoRef, setMomoRef]   = useState("");
  const [paidAmount, setPaidAmount] = useState(0); // captured before cart is cleared
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grand = +totalPrice.toFixed(2); // live value while cart is populated

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", address: "", city: "", zip: "" });

  // Pre-fill form from logged-in session
  useEffect(() => {
    const prefill = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const u = session.user;
        const fullName = u.user_metadata?.full_name || "";
        const parts = fullName.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName  = parts.slice(1).join(" ") || "";
        setForm(f => ({
          ...f,
          email:     u.email || f.email,
          firstName: firstName || f.firstName,
          lastName:  lastName  || f.lastName,
          address:   u.user_metadata?.address || f.address,
        }));
      } catch { /* not logged in — leave blank */ }
    };
    prefill();
  }, []);

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveOrder = async (ref: string) => {
    try {
      const res = await fetch("/api/paystack/submit-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: "verified", reference: ref,
          orderData: {
            firstName: form.firstName, lastName: form.lastName,
            email: form.email, phone: "", address: form.address, city: form.city, zip: form.zip,
            items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity, size: i.size, image: i.image })),
            subtotal: totalPrice, shippingFee: 0, tax: 0, total: grand,
          },
        }),
      });
      const data = await res.json();
      return data.orderId || `AB-${Math.floor(100000 + Math.random() * 900000)}`;
    } catch { return `AB-${Math.floor(100000 + Math.random() * 900000)}`; }
  };

  const pollStatus = async (ref: string, count: number) => {
    if (count > 40) { setErrorMsg("Payment timed out. Contact support if you approved."); setStage("failed"); return; }
    try {
      const res  = await fetch(`/api/paystack/verify/${ref}`);
      const data = await res.json();
      const st   = data.data?.status;
      if (st === "success") { const num = await saveOrder(ref); setOrderNum(num); setPaidAmount(grand); clearCart(); setStage("success"); return; }
      if (st === "failed" || st === "reversed") { setErrorMsg(data.data?.gateway_response || "Payment declined."); setStage("failed"); return; }
      pollRef.current = setTimeout(() => pollStatus(ref, count + 1), 3000);
    } catch { pollRef.current = setTimeout(() => pollStatus(ref, count + 1), 3000); }
  };

  // Card: Paystack verified client-side, just save the order
  const handleCardSuccess = async (ref: string) => {
    setStage("processing");
    const num = await saveOrder(ref);
    setOrderNum(num); setPaidAmount(grand); clearCart(); setStage("success");
  };

  // MoMo: prompt sent — start polling until user approves
  const handleMomoInitiated = (ref: string) => {
    setMomoRef(ref); setStage("awaiting");
    pollRef.current = setTimeout(() => pollStatus(ref, 0), 4000);
  };

  const inputCls = "w-full bg-[#fff5f7] border border-black/10 text-black text-xs px-4 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors";

  if (items.length === 0 && stage !== "success") return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-6 px-5 pt-20 text-[#050505]">
      <p className="text-black/40 tracking-widest uppercase text-sm font-semibold">Your cart is empty</p>
      <Link href="/store" className="bg-[#ff2a85] text-white text-xs font-bold tracking-widest uppercase px-10 py-4 hover:bg-[#e01b6e] transition-colors">Shop Now</Link>
    </div>
  );

  const Summary = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "bg-[#fff5f7] border border-black/5 p-5 mb-8 text-[#050505]" : "bg-[#fff5f7] border border-black/5 p-8 sticky top-28 text-[#050505]"}>
      <p className="text-[9px] tracking-[0.3em] uppercase text-black/40 mb-4 font-bold">Order Summary</p>
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={`${item.id}-${item.size}`} className="flex gap-3">
            <div className={`relative ${compact ? "w-12 h-12" : "w-14 h-14"} bg-white border border-black/5 flex-shrink-0`}>
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-[#050505]">{item.name}</p>
              <p className="text-[10px] text-black/45">{item.size} × {item.quantity}</p>
            </div>
            <p className="text-xs text-black/75 flex-shrink-0 font-medium">GHS {(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-black/50"><span>Subtotal</span><span>GHS {grand}</span></div>
        <div className="flex justify-between text-amber-700 font-semibold">
          <span>Shipping</span>
          <span className="italic">TBD</span>
        </div>
        <div className="flex justify-between font-bold text-black/90 border-t border-black/10 pt-2 text-sm">
          <span>Total (excl. shipping)</span><span>GHS {grand}</span>
        </div>
      </div>
    </div>
  );

  const Steps = ({ current }: { current: 1 | 2 }) => (
    <div className="flex items-center gap-3 mb-10">
      {[{ n: 1, label: "Shipping" }, { n: 2, label: "Payment" }].map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${current === n ? "bg-black text-white" : current > n ? "bg-green-600 text-white" : "bg-black/5 text-black/30"}`}>
              {current > n ? "✓" : n}
            </div>
            <span className={`text-[9px] tracking-widest uppercase ${current === n ? "text-black/80 font-bold" : current > n ? "text-green-600 font-bold" : "text-black/30 font-semibold"}`}>{label}</span>
          </div>
          {i === 0 && <div className={`h-px w-12 ${current > 1 ? "bg-green-600/30" : "bg-black/10"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24 pb-16 text-[#050505]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-black/90 mb-8 md:mb-12">Checkout</h1>
        <AnimatePresence mode="wait">

          {/* STEP 1 — SHIPPING */}
          {stage === "shipping" && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-[1fr_380px] gap-8 md:gap-12">
              <div>
                <Steps current={1} />
                <div className="lg:hidden"><Summary compact /></div>
                <form onSubmit={e => { e.preventDefault(); setStage("payment"); }} className="space-y-3">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-4 font-bold">Shipping Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="firstName" placeholder="First Name" required value={form.firstName} onChange={handleChange} className={inputCls} />
                    <input name="lastName"  placeholder="Last Name"  required value={form.lastName}  onChange={handleChange} className={inputCls} />
                  </div>
                  <input name="email"   type="email" placeholder="Email Address"  required value={form.email}   onChange={handleChange} className={inputCls} />
                  <AddressAutocomplete
                    value={form.address}
                    onChange={val => setForm(f => ({ ...f, address: val }))}
                    onSelect={({ address, city, zip }) =>
                      setForm(f => ({ ...f, address, city: city || f.city, zip: zip || f.zip }))
                    }
                    placeholder="Street Address"
                    className={inputCls}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="city" placeholder="City" required value={form.city} onChange={handleChange} className={inputCls} />
                    <input name="zip"  placeholder="ZIP / Postal Code" value={form.zip} onChange={handleChange} className={inputCls} />
                  </div>
                  <button type="submit" className="w-full bg-black text-white text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-neutral-800 transition-colors mt-2">
                    Continue to Payment →
                  </button>
                </form>
              </div>
              <div className="hidden lg:block"><Summary /></div>
            </motion.div>
          )}

          {/* STEP 2 — PAYMENT */}
          {stage === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-[1fr_380px] gap-8 md:gap-12">
              <div>
                <Steps current={2} />
                <div className="lg:hidden mb-6"><Summary compact /></div>
                {/* Shipping recap */}
                <div className="bg-[#fff5f7] border border-black/5 p-4 mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-black/35 mb-1 font-bold">Shipping to</p>
                    <p className="text-xs text-black/80 font-semibold">{form.firstName} {form.lastName} · {form.email}</p>
                    <p className="text-xs text-black/45">{form.address}, {form.city}</p>
                  </div>
                  <button onClick={() => setStage("shipping")} className="text-[9px] tracking-widest uppercase text-black/40 hover:text-[#ff2a85] transition-colors flex-shrink-0 font-semibold">Edit</button>
                </div>
                {errorMsg && <p className="text-red-600 text-xs border border-red-500/20 bg-red-50 px-4 py-3 mb-4 font-semibold">{errorMsg}</p>}
                <PaymentForm
                  email={form.email}
                  amount={grand}
                  onCardSuccess={handleCardSuccess}
                  onMomoInitiated={handleMomoInitiated}
                  onError={msg => { setErrorMsg(msg); }}
                />
              </div>
              <div className="hidden lg:block"><Summary /></div>
            </motion.div>
          )}

          {/* AWAITING MOMO */}
          {stage === "awaiting" && (
            <motion.div key="awaiting" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm mx-auto text-center pt-8">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border border-black/10 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border border-black/20 animate-ping opacity-20" style={{ animationDelay: "0.4s" }} />
                <div className="relative w-20 h-20 rounded-full border border-black/15 bg-[#fff5f7] flex items-center justify-center text-2xl">📱</div>
              </div>
              <p className="text-[9px] tracking-[0.35em] uppercase text-black/35 mb-3 font-bold">Awaiting Approval</p>
              <h2 className="text-2xl font-black tracking-tighter text-black/90 uppercase mb-4">Check Your Phone</h2>
              <p className="text-xs text-black/50 mb-6 leading-relaxed">Enter your MoMo PIN to approve the <strong className="text-black/80 font-bold">GHS {grand}</strong> prompt. Do not close this page.</p>
              <div className="flex items-center justify-center gap-2 mb-8">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                <span className="text-[10px] text-[#ff2a85]/70 ml-2 tracking-widest uppercase font-bold">Waiting</span>
              </div>
              <button onClick={() => { if (pollRef.current) clearTimeout(pollRef.current); setStage("payment"); setErrorMsg(""); }}
                className="text-[10px] tracking-widest uppercase text-black/30 hover:text-[#ff2a85] transition-colors font-semibold">← Cancel</button>
            </motion.div>
          )}

          {/* PROCESSING */}
          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm mx-auto text-center pt-16">
              <div className="w-12 h-12 border-2 border-black/10 border-t-[#ff2a85] rounded-full animate-spin mx-auto mb-6" />
              <p className="text-black/40 text-xs tracking-widest uppercase font-bold">Confirming your order…</p>
            </motion.div>
          )}

          {/* SUCCESS */}
          {stage === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center pt-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 rounded-full border border-green-600/30 bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </motion.div>
              <p className="text-[9px] tracking-[0.35em] uppercase text-green-600 font-bold mb-3">Payment Successful</p>
              <h1 className="text-3xl font-black tracking-tighter text-black/90 uppercase mb-3">Thank You</h1>
              <p className="text-xs text-black/50 mb-2 font-medium">Order number</p>
              <p className="text-lg font-mono font-bold text-black/90 mb-6">{orderNum}</p>

              {/* Shipping notice */}
              <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-8 text-left">
                <p className="text-[9px] tracking-widest uppercase text-amber-800 font-bold mb-1.5">📦 Shipping Fee Pending</p>
                <p className="text-[10px] text-black/50 leading-relaxed">
                  Your order total of <strong className="text-black/85 font-semibold">GHS {paidAmount.toFixed(2)}</strong> has been collected.
                  A separate email will be sent to <strong className="text-black/85 font-semibold">{form.email}</strong> confirming your delivery fee once your shipment is arranged.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/account" className="border border-black/20 text-xs tracking-widest uppercase px-8 py-4 hover:bg-black hover:text-white transition-all text-center text-black font-semibold">View Orders</Link>
                <Link href="/store" className="bg-[#ff2a85] text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-[#e01b6e] transition-colors text-center">Continue Shopping</Link>
              </div>
            </motion.div>
          )}

          {/* FAILED */}
          {stage === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm mx-auto text-center pt-8">
              <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-50 flex items-center justify-center mx-auto mb-6">
                <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <p className="text-[9px] tracking-[0.35em] uppercase text-red-600 font-bold mb-3">Payment Failed</p>
              <h2 className="text-2xl font-black tracking-tighter text-black/90 uppercase mb-3">Transaction Declined</h2>
              <p className="text-xs text-black/50 mb-8">{errorMsg || "Your payment could not be processed."}</p>
              <button onClick={() => { setStage("payment"); setErrorMsg(""); }}
                className="w-full bg-black text-white text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-neutral-800 transition-colors">Try Again</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
