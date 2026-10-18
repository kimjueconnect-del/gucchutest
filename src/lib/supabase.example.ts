// ============================================================
// Gucchu Test — Supabase Client (EXAMPLE TEMPLATE)
// ============================================================
// This file shows how to create a Supabase client for future use
// with Supabase Auth and Supabase Storage. It is NOT imported by
// the app yet — the app currently uses Prisma + custom JWT auth.
//
// To use it:
// 1. Install the SDK:  bun add @supabase/supabase-js
// 2. Rename this file to src/lib/supabase.ts
// 3. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local
// 4. Import { supabase } from '@/lib/supabase' where needed
// ============================================================

// Uncomment after installing @supabase/supabase-js:
// import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Browser-side client (uses anon key, respects RLS policies)
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (uses service role key, bypasses RLS)
// Use ONLY in server-side API routes — never expose to the browser
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================
// Example: Supabase Auth (replaces the custom JWT auth)
// ============================================================
//
// SIGNUP:
//   const { data, error } = await supabase.auth.signUp({
//     email, password, options: { data: { name, role } }
//   })
//
// LOGIN:
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email, password
//   })
//
// LOGOUT:
//   await supabase.auth.signOut()
//
// GET CURRENT USER:
//   const { data: { user } } = await supabase.auth.getUser()
//
// ============================================================
// Example: Supabase Storage (for product images)
// ============================================================
//
// UPLOAD:
//   const { data, error } = await supabaseAdmin.storage
//     .from('product-images')
//     .upload(`products/${productId}/${filename}`, fileBuffer)
//
// GET PUBLIC URL:
//   const { data } = supabaseAdmin.storage
//     .from('product-images')
//     .getPublicUrl(`products/${productId}/${filename}`)
//
// ============================================================

export {}
