"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 pt-20 text-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <p className="text-[9px] tracking-[0.35em] uppercase text-black/35 mb-4 font-bold">Welcome Back</p>
        <h1 className="text-4xl font-black tracking-tighter text-black/90 uppercase mb-12">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[#fff5f7] border border-black/10 text-black text-xs px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-[#fff5f7] border border-black/10 text-black text-xs px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors"
          />

          <div className="flex justify-end pt-1">
            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-raleway text-black/50 hover:text-[#ff2a85] transition-colors font-bold underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-red-650 text-xs bg-red-50 border border-red-500/20 px-4 py-3 font-semibold">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In…
              </>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-black/40 mt-8">
          No account?{" "}
          <Link href="/auth/signup" className="text-[#ff2a85] hover:text-[#e01b6e] transition-colors underline underline-offset-4 font-semibold">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
