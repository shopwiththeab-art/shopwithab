"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to send reset link. Please verify your email.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 pt-24 pb-20 text-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="w-10 h-[3px] bg-[#ff2a85] mb-6"></div>
        <p className="font-raleway text-[9px] tracking-[0.35em] uppercase text-black/40 mb-3 font-extrabold">
          Account Security
        </p>
        <h1 className="font-montserrat text-3xl md:text-4xl font-black tracking-tighter text-[#050505] uppercase mb-4">
          Reset Password
        </h1>
        <p className="font-raleway text-xs text-black/60 leading-relaxed font-medium mb-8">
          Enter your registered email address below and we&apos;ll send you instructions to securely reset your password.
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#fff5f7] border border-black/10 rounded-xl p-8 text-center shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-[#ff2a85]/15 text-[#ff2a85] flex items-center justify-center mx-auto mb-4 font-black text-lg">
              ✓
            </div>
            <h2 className="font-montserrat text-base font-black tracking-tight text-[#050505] uppercase mb-2">
              Check Your Email
            </h2>
            <p className="font-raleway text-xs text-black/60 leading-relaxed font-medium mb-6">
              If an account exists for <span className="font-bold text-black">{email}</span>, a password reset link has been sent to your inbox.
            </p>
            <Link
              href="/auth/login"
              className="block w-full bg-[#050505] text-white text-[11px] font-montserrat font-bold tracking-[0.2em] uppercase py-4 rounded-lg hover:bg-[#ff2a85] transition-colors"
            >
              Return to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-raleway text-[9px] font-bold uppercase tracking-widest text-black/50 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fff5f7] border border-black/10 rounded-lg text-black font-raleway text-xs px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85] transition-colors font-medium"
              />
            </div>

            {error && (
              <p className="text-[#ff2a85] text-xs bg-[#ff2a85]/10 border border-[#ff2a85]/20 rounded-lg px-4 py-3 font-raleway font-bold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#050505] text-white font-montserrat text-xs font-bold tracking-[0.25em] uppercase py-4 rounded-lg hover:bg-[#ff2a85] transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-md"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Link…
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-8 pt-6 border-t border-black/5">
          <Link
            href="/auth/login"
            className="font-raleway text-xs text-black/50 hover:text-[#ff2a85] transition-colors font-bold tracking-wide flex items-center justify-center gap-1.5"
          >
            <span>← Back to Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
