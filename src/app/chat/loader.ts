// Archivo: app/chat/actions.ts - Función para cargar contexto existente

"use server";

import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
);

async function getUserIdFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).userId;
    return userId;
  } catch (error) {
    console.error(`[CHAT] Error al extraer userId del JWT:`, error);
    return null;
  }
}

export async function loadContextData(topicId: number) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return { error: "No estás autenticado.", context: [] };
    }

    console.log(`[CHAT] Cargando contexto para userId=${userId}, topicId=${topicId}`);

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('context_data')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    if (error || !session) {
      console.log(`[CHAT] No hay sesión previa`);
      return { context: [] };
    }

    console.log(`[CHAT] Contexto cargado: ${(session.context_data || []).length} mensajes`);
    return { context: session.context_data || [] };
  } catch (error: any) {
    console.error(`[CHAT] Error al cargar contexto:`, error.message);
    return { error: error.message, context: [] };
  }
}

export async function loadAvailableTopics() {
  try {
    const { data: topics, error } = await supabaseAdmin
      .from('topics')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[CHAT] Error al cargar temas:`, error);
      return { error: error.message, topics: [] };
    }

    return { topics: topics || [] };
  } catch (error: any) {
    console.error(`[CHAT] Error en loadAvailableTopics:`, error.message);
    return { error: error.message, topics: [] };
  }
}
