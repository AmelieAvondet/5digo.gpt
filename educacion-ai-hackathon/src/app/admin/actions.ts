// Archivo: app/admin/actions.ts

"use server";

import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
);

// Verificar que el usuario está autenticado
async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    return (verified.payload as any).userId;
  } catch (error) {
    return null;
  }
}

export async function getTopics() {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return { error: "No autenticado", topics: [] };
    }

    console.log(`[ADMIN] Listando temarios`);

    const { data: topics, error } = await supabaseAdmin
      .from('topics')
      .select('id, title, content, description, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ADMIN] Error al listar temarios:`, error);
      return { error: error.message, topics: [] };
    }

    return { success: true, topics: topics || [] };
  } catch (error: any) {
    console.error(`[ADMIN] Error en getTopics:`, error.message);
    return { error: error.message, topics: [] };
  }
}

export async function createTopic(formData: FormData) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return { error: "No autenticado" };
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const description = formData.get('description') as string;

    if (!title || !content) {
      return { error: "Título y contenido son requeridos" };
    }

    console.log(`[ADMIN] Creando nuevo temario: ${title}`);

    const { data, error } = await supabaseAdmin
      .from('topics')
      .insert([{
        title,
        content,
        description: description || null,
      }])
      .select()
      .single();

    if (error) {
      console.error(`[ADMIN] Error al crear temario:`, error);
      return { error: error.message };
    }

    console.log(`[ADMIN] Temario creado con ID: ${data.id}`);
    return { success: true, topic: data };
  } catch (error: any) {
    console.error(`[ADMIN] Error en createTopic:`, error.message);
    return { error: error.message };
  }
}

export async function updateTopic(topicId: number, formData: FormData) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return { error: "No autenticado" };
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const description = formData.get('description') as string;

    if (!title || !content) {
      return { error: "Título y contenido son requeridos" };
    }

    console.log(`[ADMIN] Actualizando temario ID: ${topicId}`);

    const { data, error } = await supabaseAdmin
      .from('topics')
      .update({
        title,
        content,
        description: description || null,
      })
      .eq('id', topicId)
      .select()
      .single();

    if (error) {
      console.error(`[ADMIN] Error al actualizar temario:`, error);
      return { error: error.message };
    }

    console.log(`[ADMIN] Temario actualizado: ${topicId}`);
    return { success: true, topic: data };
  } catch (error: any) {
    console.error(`[ADMIN] Error en updateTopic:`, error.message);
    return { error: error.message };
  }
}

export async function deleteTopic(topicId: number) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return { error: "No autenticado" };
    }

    console.log(`[ADMIN] Eliminando temario ID: ${topicId}`);

    const { error } = await supabaseAdmin
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (error) {
      console.error(`[ADMIN] Error al eliminar temario:`, error);
      return { error: error.message };
    }

    console.log(`[ADMIN] Temario eliminado: ${topicId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[ADMIN] Error en deleteTopic:`, error.message);
    return { error: error.message };
  }
}
