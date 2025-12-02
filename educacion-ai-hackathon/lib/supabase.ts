// Archivo: lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Usamos la clave pública en el cliente, las claves sensibles solo en Server Actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usar clave de servicio en Server

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Deshabilitar el uso de almacenamiento del navegador para Server Actions
    autoRefreshToken: false,
    persistSession: false,
  },
});
