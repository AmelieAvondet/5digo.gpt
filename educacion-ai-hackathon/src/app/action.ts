// Archivo: app/actions.ts (Usando Server Actions de Next.js)

"use server";

import * as bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

const SALT_ROUNDS = 10;

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Insertar usuario en DB (Supabase/PostgreSQL)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash: hashedPassword }])
      .select('id')
      .single();

    if (error) throw error;

    // 3. Crear una sesión/token simple (Para un MVP rápido)
    // NOTA: En un proyecto real, usarías NextAuth.js o Supabase Auth para manejar JWTs seguros
    console.log("Usuario registrado con ID:", data.id);

    // Redirigir al chat
    redirect('/chat');

  } catch (e: any) {
    if (e.code === '23505') { // Código de error de duplicado de PostgreSQL
        return { error: "El email ya está registrado." };
    }
    return { error: e.message || "Error al registrar usuario." };
  }
}

// Lógica de login similar... (omito por brevedad, pero seguiría la misma estructura)