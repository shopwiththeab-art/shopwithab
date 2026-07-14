"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1: Create user via server API (auto-confirmed, no email verification needed)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
      }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      setError(result.error || "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: Sign them in immediately — no email confirmation required
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (signInErr) {
      // Account created but auto-login failed — send to login page
      setLoading(false);
      setDone(true);
      return;
    }

    // Signed in — go straight to account
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
        <p className="text-[9px] tracking-[0.35em] uppercase text-black/35 mb-4 font-bold">Join the Void</p>
        <h1 className="text-4xl font-black tracking-tighter text-black/90 uppercase mb-12">Sign Up</h1>

        {done ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-full border border-green-600/20 bg-green-50 flex items-center justify-center mx-auto">
              <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-black/60 font-medium">Account created. Check your email to confirm.</p>
            <Link href="/auth/login" className="block bg-[#ff2a85] text-white text-xs font-bold tracking-widest uppercase py-4 text-center hover:bg-[#e01b6e] transition-colors">
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input name="firstName" type="text" required placeholder="First Name" value={form.firstName} onChange={handleChange}
                className="bg-[#fff5f7] border border-black/10 text-black text-xs px-4 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors" />
              <input name="lastName" type="text" required placeholder="Last Name" value={form.lastName} onChange={handleChange}
                className="bg-[#fff5f7] border border-black/10 text-black text-xs px-4 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors" />
            </div>
            <input name="email" type="email" required placeholder="Email Address" value={form.email} onChange={handleChange}
              className="w-full bg-[#fff5f7] border border-black/10 text-black text-xs px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors" />
            <input name="password" type="password" required minLength={8} placeholder="Password (min 8 characters)" value={form.password} onChange={handleChange}
              className="w-full bg-[#fff5f7] border border-black/10 text-black text-xs px-5 py-4 placeholder:text-black/30 focus:outline-none focus:border-[#ff2a85]/30 transition-colors" />

            {error && (
              <p className="text-red-650 text-xs bg-red-50 border border-red-500/20 px-4 py-3 font-semibold">
                {error}
              </p>
            )}

            <p className="text-[10px] text-black/40 leading-relaxed pt-1">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
            <button type="submit" disabled={loading}
              className="w-full bg-black text-white text-xs font-bold tracking-[0.25em] uppercase py-4 hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 font-semibold">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : "Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-black/40 mt-8">
          Have an account?{" "}
          <Link href="/auth/login" className="text-[#ff2a85] hover:text-[#e01b6e] transition-colors underline underline-offset-4 font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
