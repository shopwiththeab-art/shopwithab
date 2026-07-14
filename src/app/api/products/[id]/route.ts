import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getProductById } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Query specific product by ID
    const fetchPromise = supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error || !data) {
      // Fallback to static mock products
      const staticProduct = getProductById(id);
      if (staticProduct) {
        return NextResponse.json(staticProduct);
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("API /api/products/[id] Error:", err);
    // Dynamic fallback matching
    try {
      const { id } = await params;
      const staticProduct = getProductById(id);
      if (staticProduct) return NextResponse.json(staticProduct);
    } catch {}
    return NextResponse.json({ error: "Product query error" }, { status: 500 });
  }
}
