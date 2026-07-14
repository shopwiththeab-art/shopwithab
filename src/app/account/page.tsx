"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type Order = {
  id: string;
  status: string;
  created_at: string;
  total: number;
  shipping_fee?: number;
  currency: string;
  items: { name: string; qty: number; size: string; image: string }[];
  shipping_address: string;
  shipping_city: string;
  tracking_number?: string;
};

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
};

type UserMeta = {
  full_name: string;
  email: string;
  initials: string;
  memberSince: string;
  address: string;
};

const statusColor: Record<string, string> = {
  Delivered:    "bg-green-500/15 text-green-400 border-green-500/20",
  "In Transit": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Shipped:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Processing:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Pending:      "bg-white/5 text-white/40 border-white/10",
  Cancelled:    "bg-red-500/15 text-red-400 border-red-500/20",
};

const TABS = ["Orders", "Profile", "Support"] as const;
type Tab = typeof TABS[number];

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "profile" ? "Profile" : "Orders";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab as Tab);
  const [user, setUser] = useState<UserMeta | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Password reset state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });

  // Support state
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSending(true);
    try {
      const res = await fetch("/api/account/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          subject: supportForm.subject,
          message: supportForm.message,
        }),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
        setSupportSent(true);
        setSupportForm({ subject: "", message: "" });
        setTimeout(() => setSupportSent(false), 4000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSupportSending(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) { router.push("/auth/login"); return; }

      const u = session.user;
      const name = u.user_metadata?.full_name || u.email || "Member";
      const parts = name.split(" ");
      const initials = parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

      const memberSince = new Date(u.created_at).toLocaleDateString("en-US", {
        month: "long", year: "numeric"
      });

      const address = u.user_metadata?.address || "";
      setUser({ full_name: name, email: u.email || "", initials, memberSince, address });
      setEditName(name);
      setEditAddress(address);

      // Fetch orders
      const orderRes = await fetch(`/api/account/orders?email=${encodeURIComponent(u.email || "")}`);
      const orderData = await orderRes.json();
      setOrders(Array.isArray(orderData) ? orderData : []);
      
      // Fetch tickets
      const ticketRes = await fetch(`/api/account/tickets?email=${encodeURIComponent(u.email || "")}`);
      const ticketData = await ticketRes.json();
      setTickets(Array.isArray(ticketData) ? ticketData : []);
      
      setLoading(false);
    };
    init();
  }, [router]);

  const handleChangePassword = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwMsg({ text: "Passwords do not match.", ok: false }); return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ text: "Password must be at least 8 characters.", ok: false }); return;
    }
    setPwSaving(true);
    const supabase = createClient();
    // Re-authenticate first to verify current password
    const { data: { session } } = await supabase.auth.getSession();
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: session?.user.email || "",
      password: pwForm.current,
    });
    if (reAuthErr) {
      setPwMsg({ text: "Current password is incorrect.", ok: false });
      setPwSaving(false); return;
    }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwSaving(false);
    if (error) { setPwMsg({ text: error.message, ok: false }); }
    else {
      setPwMsg({ text: "Password updated successfully.", ok: true });
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwMsg({ text: "", ok: true }), 4000);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName.trim(), address: editAddress.trim() }
    });
    setSaving(false);
    if (!error) {
      setUser(u => u ? { ...u, full_name: editName.trim() } : u);
      setSaveMsg("Profile updated.");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);

  const bg    = "bg-white text-[#050505]";
  const bgCard= "bg-[#fff5f7]";
  const border= "border-black/5";
  const txt   = "text-black/90";
  const txt2  = "text-black/35 font-bold";
  const inp   = "bg-white border-black/10 text-black placeholder:text-black/30 focus:border-[#ff2a85]/30";
  const btn   = "bg-black text-white hover:bg-neutral-800 font-semibold";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-black/10 border-t-[#ff2a85] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pt-16 transition-colors duration-300`}>

      {/* ── Hero banner ─────────────────────────────────────── */}
      <div className={`relative ${bgCard} border-b ${border} overflow-hidden transition-colors duration-300`}>
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-2xl md:text-3xl font-black tracking-tighter">
                  {user?.initials}
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#fff5f7]" />
            </div>

            {/* Name + badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className={`text-2xl md:text-3xl font-black tracking-tighter ${txt} uppercase truncate`}>
                  {user?.full_name}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-650" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-amber-700 font-bold">New Member</span>
                </span>
              </div>
              <p className={`text-xs ${txt2} tracking-wide`}>{user?.email}</p>
              <p className={`text-[10px] ${txt2} tracking-widest uppercase mt-1`}>Member since {user?.memberSince}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 flex-shrink-0 items-start mt-3 sm:mt-0 pt-4 sm:pt-0 border-t border-black/5 sm:border-t-0 w-full sm:w-auto justify-start sm:justify-end">
              {[
                { label: "Orders",  value: orders.length.toString() },
                { label: "Spent",   value: `GHS ${totalSpent.toFixed(0)}` },
              ].map(s => (
                <div key={s.label} className="text-left sm:text-right">
                  <p className={`text-xl md:text-2xl font-black tracking-tighter ${txt}`}>{s.value}</p>
                  <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 mt-8 border-b border-black/5">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-[10px] tracking-[0.25em] uppercase transition-colors ${
                  activeTab === tab ? "text-[#ff2a85] font-bold" : "text-black/40 hover:text-black/60 font-semibold"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="account-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-[#ff2a85]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">

          {/* ── ORDERS TAB ──────────────────────────────────── */}
          {activeTab === "Orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {orders.length === 0 ? (
                <div className="text-center py-24 border border-black/5 bg-[#fff5f7]">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 mb-4 font-bold">No Orders Yet</p>
                  <p className="text-black/50 text-sm mb-8">Your order history will appear here</p>
                  <Link href="/store"
                    className="inline-block bg-[#ff2a85] text-white text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 hover:bg-[#e01b6e] transition-colors">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-black/5 hover:border-black/10 transition-colors bg-[#fff5f7]/50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Order ID & date */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p className="text-sm font-mono font-bold text-black/95">{order.id}</p>
                            <span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 border rounded-sm ${statusColor[order.status] || "bg-black/5 text-black/45 border-black/10"}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-black/40">
                            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-black/30 mt-0.5 font-medium">
                            {order.items?.length || 0} item(s) · {order.shipping_city}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black tracking-tight text-black/95">
                            {order.currency} {Number(order.total).toFixed(2)}
                          </p>
                          <p className="text-[9px] text-[#ff2a85]/70 tracking-widest uppercase mt-1 font-semibold">View Details →</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PROFILE TAB ─────────────────────────────────── */}
          {activeTab === "Profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="space-y-6 max-w-xl mx-auto">
              {/* Member tier benefits card (VIP Perks & Status without duplicating Hero banner stats) */}
              <div className="relative overflow-hidden border border-amber-200 bg-amber-50 p-6 rounded-sm">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
                  style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-amber-800 font-bold">Store Membership</span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-600/10 border border-amber-600/20 px-2.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span className="text-[9px] tracking-widest uppercase text-amber-700 font-bold">Active Status</span>
                  </span>
                </div>
                <p className="text-xl font-black tracking-tighter text-black/95 uppercase mb-2">VIP Access & Perks</p>
                <p className="text-xs text-black/65 leading-relaxed font-medium">
                  As a valued Shopwith.ab account holder, your membership unlocks early access to live catalogue drops, exclusive wear releases, priority order dispatch, and dedicated customer support.
                </p>
              </div>

              {/* Edit profile */}
              <div className={`border ${border} ${bgCard} p-6 space-y-5 transition-colors duration-300`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2}`}>Personal Information</p>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>Display Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors ${inp}`}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>Delivery Address</label>
                  <input
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors ${inp}`}
                    placeholder="Street address, city"
                  />
                </div>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>Email Address</label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className={`w-full border text-sm px-4 py-3.5 cursor-not-allowed opacity-50 ${inp}`}
                  />
                  <p className={`text-[9px] ${txt2} mt-1.5 opacity-60`}>Email cannot be changed here. Contact support.</p>
                </div>

                {saveMsg && (
                  <p className="text-green-600 text-xs flex items-center gap-2 font-semibold">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {saveMsg}
                  </p>
                )}

                <button
                  onClick={handleSaveName}
                  disabled={saving || (editName === user?.full_name && editAddress === (user?.address ?? ""))}
                  className={`w-full text-xs font-bold tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 ${btn}`}
                >
                  {saving ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  ) : "Save Changes"}
                </button>
              </div>

              {/* Password Reset */}
              <div className={`border ${border} ${bgCard} p-6 space-y-4 transition-colors duration-300`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2}`}>Change Password</p>
                {(["current","next","confirm"] as const).map((k, i) => (
                  <div key={k}>
                    <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>
                      {k === "current" ? "Current Password" : k === "next" ? "New Password" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      value={pwForm[k]}
                      onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors font-mono tracking-widest ${inp}`}
                    />
                  </div>
                ))}
                {pwMsg.text && (
                  <p className={`text-xs flex items-center gap-2 font-semibold ${pwMsg.ok ? "text-green-600" : "text-red-650"}`}>
                    {pwMsg.ok
                      ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                    {pwMsg.text}
                  </p>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  className={`w-full text-xs font-bold tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 ${btn}`}
                >
                  {pwSaving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</> : "Update Password"}
                </button>
              </div>

              {/* Account actions */}
              <div className={`border ${border} ${bgCard} p-6 transition-colors duration-300`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2} mb-5`}>Account</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/store"
                    className="flex-1 border border-black/25 text-xs tracking-widest uppercase px-6 py-3.5 text-black/60 hover:bg-black hover:text-white transition-all text-center font-semibold">
                    Shop Now
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 border border-red-500/20 text-xs tracking-widest uppercase px-6 py-3.5 text-red-650 hover:bg-red-50 hover:text-red-600 transition-all font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUPPORT TAB ──────────────────────────────────── */}
          {activeTab === "Support" && (
            <motion.div key="support" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto space-y-6">
              
              {/* Header & Controls */}
              <div className="flex items-end justify-between border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-black/90 uppercase">Support Center</h2>
                  <p className="text-xs text-black/50 mt-1 font-semibold">Manage your tickets or open a new one.</p>
                </div>
                {!showNewTicketForm && (
                  <button 
                    onClick={() => setShowNewTicketForm(true)}
                    className="text-[9px] font-bold tracking-widest uppercase border border-black/20 hover:bg-black hover:text-white transition-colors px-4 py-2"
                  >
                    Open New Ticket
                  </button>
                )}
              </div>

              {/* New Ticket Form (Toggleable) */}
              <AnimatePresence>
                {showNewTicketForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`border ${border} ${bgCard} p-6 sm:p-8 transition-colors duration-300 relative`}>
                      <button 
                        onClick={() => setShowNewTicketForm(false)}
                        className="absolute top-4 right-4 text-black/35 hover:text-black"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      
                      <div className="mb-8">
                        <h2 className="text-lg font-black tracking-tight text-black/90 uppercase">New Ticket</h2>
                        <p className="text-[10px] text-black/45 mt-2 uppercase tracking-widest font-bold">
                          Response time: 1-2 business days
                        </p>
                      </div>

                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div>
                          <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>Subject / Topic</label>
                          <div className="relative w-full">
                            <select
                              required
                              value={supportForm.subject}
                              onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                              className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors appearance-none cursor-pointer pr-10 ${inp}`}
                            >
                              <option value="" disabled className="bg-white text-black">Select a topic...</option>
                              {["Order Inquiry", "Returns & Exchanges", "Product Question", "Other"].map(opt => (
                                <option key={opt} value={opt} className="bg-white text-black">{opt}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black/35">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2`}>Message</label>
                          <textarea
                            required
                            rows={5}
                            placeholder="How can we help you?"
                            value={supportForm.message}
                            onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                            className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors resize-none ${inp}`}
                          />
                        </div>

                        {supportSent ? (
                          <div className="bg-green-50 border border-green-200 px-4 py-4 text-center mt-2">
                            <p className="text-[10px] text-green-600 font-bold tracking-widest uppercase">Message Sent Successfully</p>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            disabled={supportSending || !supportForm.subject || !supportForm.message}
                            className={`w-full mt-2 text-xs font-bold tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 ${btn}`}
                          >
                            {supportSending ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : "Submit Ticket"}
                          </button>
                        )}
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Previous Tickets List */}
              <div className="space-y-3">
                {tickets.length > 0 ? tickets.map(t => {
                  const isExpanded = expandedTicketId === t.id;
                  return (
                    <div key={t.id} className={`border ${border} transition-colors duration-300 overflow-hidden ${isExpanded ? 'bg-white' : bgCard}`}>
                      {/* Ticket Row Header */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-bold text-black/90">{t.subject}</h3>
                            <span className={`text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm border ${
                              t.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200 font-semibold' : 
                              t.status === 'Replied' ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' : 
                              'bg-black/5 text-black/40 border-black/10 font-semibold'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-black/40 uppercase tracking-widest font-mono">
                            ID: {t.id.slice(0, 8)} • {new Date(t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                          className="text-[9px] tracking-widest uppercase border border-black/15 px-4 py-2 hover:bg-[#fff5f7] transition-colors whitespace-nowrap self-start sm:self-auto font-semibold"
                        >
                          {isExpanded ? 'Close' : 'View'}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-black/5"
                          >
                            <div className="p-5 sm:p-6 space-y-6">
                              {/* User Message */}
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-black/40 mb-2 font-bold">Your Message</p>
                                <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap font-medium">{t.message}</p>
                              </div>
                              
                              {/* Admin Reply */}
                              {t.reply && (
                                <div className="bg-blue-50 border border-blue-150 p-5 rounded-sm">
                                  <p className="text-[9px] uppercase tracking-[0.2em] text-blue-800 mb-2 flex items-center gap-2 font-bold">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    Shopwith.ab Support
                                  </p>
                                  <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap font-medium">{t.reply}</p>
                                </div>
                              )}

                              {!t.reply && t.status !== "Resolved" && (
                                <div className="bg-black/5 border border-black/5 p-4 rounded-sm flex items-center gap-3">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                  <p className="text-[10px] text-black/50 uppercase tracking-widest font-bold">Awaiting Response</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }) : (
                  <div className={`border ${border} ${bgCard} p-12 text-center`}>
                    <p className="text-xs text-black/40 tracking-widest uppercase mb-4 font-bold">No support tickets yet.</p>
                    <button 
                      onClick={() => setShowNewTicketForm(true)}
                      className="text-[10px] border-b border-black/20 text-[#ff2a85] hover:text-[#e01b6e] hover:border-[#e01b6e] pb-0.5 transition-all uppercase tracking-widest font-bold"
                    >
                      Open your first ticket
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-black/5 text-center">
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2} mb-3`}>Or email us directly</p>
                <a href="mailto:support@shopwith.ab" className="text-sm font-semibold text-black/70 hover:text-[#ff2a85] transition-colors">
                  support@shopwith.ab
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Order Detail Modal ───────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white border border-black/10 w-full max-w-md max-h-[85vh] overflow-y-auto text-[#050505]"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 font-bold">Order Details</p>
                  <p className="text-sm font-mono font-bold text-black/90 mt-0.5">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-black/35 hover:text-black transition-colors">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status + Date */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] tracking-widest uppercase px-3 py-1.5 border rounded-sm ${statusColor[selectedOrder.status] || "bg-black/5 text-black/45 border-black/10"}`}>
                    {selectedOrder.status}
                  </span>
                  <p className="text-xs text-black/40">
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 font-bold">Items</p>
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs border-b border-black/5 pb-3">
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
                    </div>
                  ))}
                </div>

                {/* Delivery */}
                <div className="border-t border-black/10 pt-4">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 font-bold mb-2">Delivery Address</p>
                  <p className="text-xs text-black/60 font-medium">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                </div>

                {/* Tracking Number */}
                {selectedOrder.tracking_number && (
                  <div className="border border-cyan-200 bg-cyan-50 rounded-sm px-4 py-3">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-cyan-800 mb-1.5 font-bold">📦 Tracking Number</p>
                    <p className="text-sm font-mono font-bold text-cyan-700">{selectedOrder.tracking_number}</p>
                    <p className="text-[10px] text-black/40 mt-1">Use this number on your courier&apos;s website to track your shipment.</p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-black/10 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-black/50">Total Paid (excl. shipping)</span>
                    <span className="text-sm font-black text-black/90">{selectedOrder.currency} {Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping_fee !== undefined && selectedOrder.shipping_fee !== null && (
                    <div className="flex justify-between">
                      <span className="text-xs text-amber-700 font-bold uppercase tracking-widest">Shipping Fee</span>
                      <span className="text-sm font-black text-amber-700">{selectedOrder.currency} {Number(selectedOrder.shipping_fee).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/track-order"
                  className="block w-full border border-black/25 text-center text-xs tracking-widest uppercase py-4 text-black/60 hover:bg-black hover:text-white transition-all font-semibold"
                  onClick={() => setSelectedOrder(null)}
                >
                  Track This Order
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
