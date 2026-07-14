"use client";

import { useState } from "react";
import Script from "next/script";

const PROVIDERS = [
  { value: "mtn",      label: "MTN Mobile Money" },
  { value: "vodafone", label: "Telecel (Vodafone)" },
  { value: "tigo",     label: "AirtelTigo" },
];

type Method = "card" | "mobile_money" | null;
type MoMoStage = "form" | "awaiting";

interface Props {
  email: string;
  amount: number; // GHS
  onCardSuccess: (reference: string) => void;
  onMomoInitiated: (reference: string) => void;
  onError: (msg: string) => void;
}

export default function PaymentForm({ email, amount, onCardSuccess, onMomoInitiated, onError }: Props) {
  const [method, setMethod]       = useState<Method>(null);
  const [momoStage, setMomoStage] = useState<MoMoStage>("form");
  const [paystackReady, setPaystackReady] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [momo, setMomo]           = useState({ phone: "", provider: "mtn" });

  const inp = "w-full bg-black/[0.03] border border-black/15 text-black text-xs px-4 py-4 placeholder:text-black/35 focus:outline-none focus:border-black/40 focus:bg-white transition-colors font-medium";

  // ── Card: open Paystack secure popup ─────────────────────────
  const openCardPopup = () => {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) { onError("Payment system not loaded. Please refresh."); return; }
    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100), // pesewas
      currency: "GHS",
      channels: ["card"], // card only — MoMo stays embedded
      ref: `AB-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      callback: (response: { reference: string }) => {
        onCardSuccess(response.reference);
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  // ── MoMo: fully embedded API call ────────────────────────────
  const submitMomo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res  = await fetch("/api/paystack/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mobile_money",
          email, amount,
          phone: momo.phone,
          provider: momo.provider,
        }),
      });
      const data = await res.json();
      const ref  = data.data?.reference;
      if (!data.status && !ref) {
        onError(data.message || "Could not initiate MoMo payment.");
      } else {
        setMomoStage("awaiting");
        onMomoInitiated(ref);
      }
    } catch { onError("Network error. Please try again."); }
    setBusy(false);
  };

  // ── Method selector ──────────────────────────────────────────
  if (!method) {
    return (
      <>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          onLoad={() => setPaystackReady(true)}
        />
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase text-black/50 mb-4 font-bold">Choose Payment Method</p>
          {[
            { id: "card" as Method,         icon: "💳", label: "Debit / Credit Card",  sub: "Visa, Mastercard, Verve — secure Paystack vault" },
            { id: "mobile_money" as Method, icon: "📱", label: "Mobile Money",          sub: "MTN, Telecel, AirtelTigo — prompt sent to your phone" },
          ].map(m => (
            <button key={m.id!} onClick={() => setMethod(m.id)}
              className="w-full flex items-center gap-4 bg-black/[0.03] border border-black/10 hover:border-black/30 hover:bg-black/[0.06] p-5 transition-all text-left group rounded-sm shadow-sm">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-black/90 group-hover:text-black transition-colors">{m.label}</p>
                <p className="text-[10px] text-black/55 mt-1 font-medium">{m.sub}</p>
              </div>
              <span className="text-black/30 group-hover:text-[#ff2a85] group-hover:translate-x-1 transition-all text-base font-bold">→</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  // ── Card: launch Paystack popup ──────────────────────────────
  if (method === "card") {
    return (
      <>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          onLoad={() => setPaystackReady(true)}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-black/50 font-bold">Card Payment</p>
            <button onClick={() => setMethod(null)} className="text-[10px] uppercase tracking-widest text-black/40 hover:text-[#ff2a85] transition-colors font-bold">← Back</button>
          </div>
          {/* Security notice */}
          <div className="bg-green-500/10 border border-green-600/25 p-4 flex gap-3 items-start rounded-sm">
            <span className="text-green-600 text-sm mt-0.5">🔒</span>
            <div>
              <p className="text-[10px] text-green-700 font-bold tracking-widest uppercase mb-1">Secure Card Payment</p>
              <p className="text-xs text-black/65 leading-relaxed font-medium">
                Your card details are entered directly in Paystack&apos;s encrypted vault. We never see or store your card number.
              </p>
            </div>
          </div>
          <button
            onClick={openCardPopup}
            disabled={!paystackReady}
            className="w-full bg-[#050505] text-white text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-[#ff2a85] transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg">
            {paystackReady ? `Pay GHS ${amount} Securely →` : "Loading secure payment…"}
          </button>
        </div>
      </>
    );
  }

  // ── MoMo: awaiting screen ────────────────────────────────────
  if (momoStage === "awaiting") {
    return (
      <div className="text-center py-6 border border-black/10 bg-black/[0.02] p-6">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-black/15 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full border border-black/20 bg-white flex items-center justify-center text-2xl shadow-sm">📱</div>
        </div>
        <p className="text-xs text-black/60 mb-1 font-semibold">MoMo prompt sent to</p>
        <p className="text-base font-mono font-bold text-black/90 mb-4">{momo.phone}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          <span className="text-[10px] text-[#ff2a85] ml-2 tracking-widest uppercase font-bold">Waiting for approval</span>
        </div>
        <p className="text-xs text-black/50 font-medium">Enter your MoMo PIN on your phone. Do not close this page.</p>
      </div>
    );
  }

  // ── MoMo: entry form ─────────────────────────────────────────
  return (
    <form onSubmit={submitMomo} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.3em] uppercase text-black/50 font-bold">Mobile Money</p>
        <button type="button" onClick={() => setMethod(null)} className="text-[10px] uppercase tracking-widest text-black/40 hover:text-[#ff2a85] transition-colors font-bold">← Back</button>
      </div>
      <select value={momo.provider} onChange={e => setMomo(m => ({ ...m, provider: e.target.value }))}
        className={inp + " cursor-pointer bg-white"}>
        {PROVIDERS.map(p => <option key={p.value} value={p.value} className="bg-white text-black font-medium">{p.label}</option>)}
      </select>
      <input required type="tel" placeholder="Mobile Money Number (e.g. 0241234567)"
        value={momo.phone} onChange={e => setMomo(m => ({ ...m, phone: e.target.value }))}
        className={inp} />
      <p className="text-xs text-black/60 leading-relaxed font-medium">
        A <strong className="text-black/90 font-bold">GHS {amount}</strong> prompt will be sent to this phone number. Approve with your MoMo PIN.
      </p>
      <button type="submit" disabled={busy}
        className="w-full bg-[#050505] text-white text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-[#ff2a85] transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-3 shadow-lg">
        {busy
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending Prompt…</>
          : `Send GHS ${amount} MoMo Prompt →`}
      </button>
    </form>
  );
}
