import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { products as fallbackProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

// GET /api/products — fetch all from Supabase with 1.5s timeout fallback
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const supabase = await createClient();
    let query = supabase.from('products').select('*').order('created_at', { ascending: true });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const { data, error } = await Promise.race([query, timeoutPromise]);
    if (error) console.error("API /api/products DB Error:", error);
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(fallbackProducts);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("API /api/products CATCH BLOCK ERROR:", err);
    return NextResponse.json(fallbackProducts);
  }
}
