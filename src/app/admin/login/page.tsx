"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      // Check stored custom credentials first if any exist
      const savedCredsRaw = localStorage.getItem("shopwithab_admin_creds");
      const savedCreds = savedCredsRaw ? JSON.parse(savedCredsRaw) : null;

      const isSuperAdmin =
        (u === "superadmin@shopwith.ab" || u === "superadmin") &&
        (p === (savedCreds?.superAdminPassword || "SuperAdmin#2026!AB"));

      const isAdmin =
        ((u === "admin@shopwith.ab" || u === "admin") &&
         p === (savedCreds?.adminPassword || "ShopwithabAdmin#8842")) ||
        // Fallback for direct password only entry if username is left empty
        (!u && p === "ShopwithabAdmin#8842");

      if (isSuperAdmin) {
        sessionStorage.setItem("shopwithab_admin", "true");
        sessionStorage.setItem("shopwithab_admin_role", "SUPER ADMIN");
        sessionStorage.setItem("shopwithab_admin_user", "superadmin@shopwith.ab");
        router.push("/admin");
      } else if (isAdmin) {
        sessionStorage.setItem("shopwithab_admin", "true");
        sessionStorage.setItem("shopwithab_admin_role", "ADMIN");
        sessionStorage.setItem("shopwithab_admin_user", u || "admin@shopwith.ab");
        router.push("/admin");
      } else {
        setError(true);
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-2xl font-black tracking-[0.35em] uppercase text-[#050505] font-montserrat mb-1">
            SHOPWITH.AB
          </p>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#ff2a85] font-extrabold font-raleway">
            Portal Authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 border border-black/8 rounded-xl shadow-xl">
          <div>
            <label className="block text-[9px] font-raleway font-bold tracking-[0.3em] uppercase text-black/50 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="superadmin@shopwith.ab"
              autoFocus
              className="w-full bg-black/[0.03] border border-black/15 rounded-lg text-[#050505] text-xs px-4 py-3.5 placeholder:text-black/25 focus:outline-none focus:border-[#ff2a85] transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-raleway font-bold tracking-[0.3em] uppercase text-black/50 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black/[0.03] border border-black/15 rounded-lg text-[#050505] text-xs px-4 py-3.5 placeholder:text-black/25 focus:outline-none focus:border-[#ff2a85] transition-colors font-mono tracking-widest"
            />
          </div>

          {error && (
            <p className="text-[11px] font-raleway font-bold tracking-wider text-[#ff2a85] bg-[#ff2a85]/10 border border-[#ff2a85]/20 p-3 rounded-lg text-center">
              Invalid credentials. Please verify your username & password.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#ff2a85] text-white text-xs font-montserrat font-black tracking-[0.25em] uppercase py-4 rounded-lg hover:bg-[#ff2a85]/90 transition-all shadow-lg shadow-[#ff2a85]/20 disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating…" : "Sign In To Portal"}
          </button>
        </form>

        <p className="text-center text-[9px] font-raleway text-black/25 tracking-widest mt-6 uppercase">
          SHOPWITH.AB Security Gateway v2.4
        </p>
      </div>
    </div>
  );
}
