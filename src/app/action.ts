// Archivo: app/action.ts (Usando Server Actions de Next.js)

"use server";

import * as bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SALT_ROUNDS = 10;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
);

// ========== FUNCIONES DE AUTENTICACIÓN ==========

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }

  try {
    console.log(`[AUTH] Intento de login para: ${email}`);

    // 1. Buscar usuario en DB por email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log(`[AUTH] Usuario no encontrado: ${email}`);
      return { error: "Email o contraseña incorrectos." };
    }

    // 2. Verificar contraseña con bcrypt
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      console.log(`[AUTH] Contraseña incorrecta para: ${email}`);
      return { error: "Email o contraseña incorrectos." };
    }

    // 3. Crear JWT
    console.log(`[AUTH] Creando JWT para usuario: ${user.id}`);
    const token = await new SignJWT({ userId: user.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // 4. Guardar JWT en cookie HTTP-Only
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    console.log(`[AUTH] Login exitoso para: ${email}`);
    return { success: true, userId: user.id };

  } catch (e: any) {
    console.error(`[AUTH] Error en login:`, e.message);
    return { error: e.message || "Error al realizar login." };
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Registrando nuevo usuario: ${email}`);

    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Insertar usuario en DB (Supabase/PostgreSQL)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash: hashedPassword }])
      .select('id')
      .single();

    if (error) throw error;

    console.log(`[AUTH] Usuario registrado con ID: ${data.id}`);

    // 3. Crear JWT automáticamente después del registro
    const token = await new SignJWT({ userId: data.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // 4. Guardar JWT en cookie HTTP-Only
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log(`[AUTH] Registro exitoso y JWT creado para: ${email}`);
    return { success: true, userId: data.id };

  } catch (e: any) {
    console.error(`[AUTH] Error en registro:`, e.message);
    if (e.code === '23505') {
        return { error: "El email ya está registrado." };
    }
    return { error: e.message || "Error al registrar usuario." };
  }
}

export async function logoutUser() {
  try {
    console.log(`[AUTH] Logout solicitado`);
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return { success: true };
  } catch (e: any) {
    console.error(`[AUTH] Error en logout:`, e.message);
    return { error: e.message || "Error al cerrar sesión." };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { user: null };
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as { userId: string; email: string };
    
    return { user: { id: payload.userId, email: payload.email } };
  } catch (e: any) {
    console.error(`[AUTH] Error al verificar token:`, e.message);
    return { user: null };
  }
}