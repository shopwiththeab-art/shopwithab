// ================================================================
//  Shopwith.ab — Create User & Admin Accounts
//  Run once: node scripts/create-accounts.js
// ================================================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role bypasses email confirmation
);

async function createAccounts() {
  console.log('Creating Shopwith.ab accounts...\n');

  // ── 1. Regular Customer Account ──────────────────────────────
  const { data: user, error: userErr } = await supabase.auth.admin.createUser({
    email:          'customer@shopwith.ab',
    password:       'Shopwithab@2026',
    email_confirm:  true,              // skip email confirmation
    user_metadata: {
      full_name:   'Shopwith.ab Customer',
      first_name:  'Shopwith.ab',
      last_name:   'Customer',
    },
  });

  if (userErr) {
    console.error('❌ Customer account error:', userErr.message);
  } else {
    console.log('✅ Customer account created');
    console.log('   Email   : customer@shopwith.ab');
    console.log('   Password: Shopwithab@2026');
    console.log('   Login at: http://localhost:3000/auth/login\n');
  }

  // ── 2. Admin Account (Supabase Auth) ─────────────────────────
  const { data: admin, error: adminErr } = await supabase.auth.admin.createUser({
    email:          'admin@shopwith.ab',
    password:       'ShopwithabAdmin@2026',
    email_confirm:  true,
    user_metadata: {
      full_name: 'Shopwith.ab Admin',
      role:      'admin',
    },
  });

  if (adminErr) {
    console.error('❌ Admin account error:', adminErr.message);
  } else {
    console.log('✅ Admin account created');
    console.log('   Email   : admin@shopwith.ab');
    console.log('   Password: ShopwithabAdmin@2026');
  }

  console.log('\n── Admin Console ───────────────────────────────────');
  console.log('   URL     : http://localhost:3000/admin/login');
  console.log('   Password: ShopwithabAdmin#8842');
  console.log('────────────────────────────────────────────────────\n');
  console.log('Done. Change all passwords after first login.');
}

createAccounts().catch(console.error);
