import { createClient } from '@supabase/supabase-js'

// Cliente para uso no CLIENT-SIDE (Storage, Realtime)
// Para operações de banco de dados, use o PRISMA nas Server Actions/API Routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
