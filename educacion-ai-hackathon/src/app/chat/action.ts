// Archivo: app/chat/action.ts (Modificado para Gemini)

"use server";

// 1. Importar el SDK de Google Gen AI en lugar de OpenAI
import { GoogleGenAI, Content } from "@google/genai";
import { supabaseAdmin } from '@/lib/supabase';

// 2. Inicializar el cliente de la IA (Lee de .env.local)
// La clase GoogleGenAI busca automáticamente la variable de entorno GEMINI_API_KEY
const ai = new GoogleGenAI({});

// Define el tipo de contexto de la conversación (ajustado a Gemini)
// Gemini usa 'user' y 'model' para los turnos de conversación
type ConversationMessage = { role: 'user' | 'assistant'; content: string };

export async function chatWithAI(userId: string, topicId: number, newMessage: string) {
  try {
    console.log(`[DEBUG] Iniciando chatWithAI: userId=${userId}, topicId=${topicId}`);

    // 1. Obtener la sesión actual del usuario y el temario
    const { data: currentSession, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, context_data')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    console.log(`[DEBUG] Búsqueda de sesión:`, { sessionError, currentSession });

    let session = currentSession;

    // Si no existe la sesión, crearla
    if (sessionError) {
      console.log(`[DEBUG] Sesión no encontrada, creando nueva sesión...`);
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          topic_id: topicId,
          context_data: []
        }])
        .select('id, context_data')
        .single();

      console.log(`[DEBUG] Intento de crear sesión:`, { createError, newSession });

      if (createError) {
        console.error(`[ERROR] Error al crear sesión:`, createError);
        return { error: `Error al crear sesión: ${createError.message}` };
      }
      session = newSession;
    }

    if (!session) {
      return { error: "No se pudo obtener o crear la sesión de chat." };
    }

    // 2. Obtener el contenido del temario
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select('content')
      .eq('id', topicId)
      .single();

    console.log(`[DEBUG] Búsqueda de tema:`, { topicError, topic: topic ? "found" : "not found" });

    if (topicError || !topic) {
      console.error(`[ERROR] Error al obtener tema:`, topicError);
      return { error: `Error al obtener el temario: ${topicError?.message || 'No encontrado'}` };
    }

    const topicContent = topic.content;
    console.log(`[DEBUG] Contenido del tema obtenido`);

    // ********** Lógica de Llamada a la IA (Modificada) **********

    // 3. Construir el historial y el System Prompt
    // El System Prompt de Gemini se pasa como una opción separada, no como un mensaje 'system' en el historial.

    const systemPrompt = `Eres un tutor experto en ${topicContent}. 
                          Tu objetivo es guiar al alumno a través del temario, responder sus dudas
                          y evaluar su progreso.`;

    // Mapear el historial guardado (que usa 'user' y 'assistant') a la estructura Content de Gemini ('user' y 'model')
    const mappedContext: Content[] = (session.context_data || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Agregar el nuevo mensaje del alumno
    const userMessagePart: Content = {
        role: 'user',
        parts: [{ text: newMessage }],
    };
    const messagesToSend: Content[] = [...mappedContext, userMessagePart];

    console.log(`[DEBUG] Enviando ${messagesToSend.length} mensajes a Gemini`);

    // 4. Llamada a la API de la IA (Gemini)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Modelo rápido para hackathon
        contents: messagesToSend,
        systemInstruction: systemPrompt,
    } as any);

    const aiResponse = response.text || "Lo siento, no pude procesar tu solicitud con Gemini.";
    console.log(`[DEBUG] Respuesta recibida de Gemini (${aiResponse.length} caracteres)`);

    // 5. Actualizar el contexto en la DB
    // NOTA: Asegúrate de guardar los mensajes en el formato que usará tu UI (probablemente 'user'/'assistant')
    const newContext: ConversationMessage[] = [
        ...(session.context_data || []),
        { role: 'user', content: newMessage },
        { role: 'assistant', content: aiResponse }, // Usar 'assistant' para guardar en DB/mostrar en UI
    ];

    console.log(`[DEBUG] Actualizando sesión con ${newContext.length} mensajes`);

    // Guardar el nuevo contexto en la base de datos
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({ context_data: newContext })
      .eq('id', session.id);

    if (updateError) {
      console.error(`[ERROR] Error al actualizar sesión:`, updateError);
      return { error: `Error al guardar el contexto: ${updateError.message}` };
    }

    console.log(`[DEBUG] Sesión actualizada exitosamente`);

    // 6. Devolver la respuesta de la IA
    return { response: aiResponse, fullContext: newContext };
  } catch (error: any) {
    console.error(`[ERROR] Excepción en chatWithAI:`, error);
    return { error: error.message || "Error al procesar el mensaje.", response: undefined, fullContext: [] };
  }
}