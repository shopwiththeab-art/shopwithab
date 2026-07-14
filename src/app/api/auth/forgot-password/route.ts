import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordReset } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Forgot Password] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate recovery link using Supabase Admin API without triggering Supabase Auth email
    const origin = new URL(req.url).origin;
    const redirectTo = `${origin}/auth/reset-password`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('[Forgot Password] generateLink error:', error.message);
      if (
        error.message.toLowerCase().includes('not found') ||
        error.message.toLowerCase().includes('no user') ||
        error.message.toLowerCase().includes('user not found')
      ) {
        // Return success to avoid email enumeration for non-existent users
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json({ error: 'Failed to generate recovery token.' }, { status: 500 });
    }

    // Send via custom Nodemailer SMTP server (support@winningedge...)
    const sent = await sendPasswordReset({
      to: email.trim(),
      resetUrl: actionLink,
    });

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to dispatch email via custom SMTP server.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Forgot Password API] Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
