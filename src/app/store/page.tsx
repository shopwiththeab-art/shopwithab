// Server Component — no "use client"
// Products are fetched directly from Supabase at request time.
// No loading flash — HTML arrives with products already included.

import { createClient } from "@/utils/supabase/server";
import StoreClient from "./StoreClient";
import { products as fallbackProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

async function fetchProducts(): Promise<any[]> {
  try {
    const supabase = await createClient();
    const fetchPromise = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase timeout")), 10000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    if (error) console.error("fetchProducts DB Error:", error);
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return fallbackProducts;
    }
    return data;
  } catch (err) {
    console.error("fetchProducts CATCH BLOCK ERROR:", err);
    return fallbackProducts;
  }
}

export default async function StorePage() {
  const products = await fetchProducts();

  return <StoreClient initialProducts={products} />;
}
