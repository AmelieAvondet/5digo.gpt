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
    // Obtener la sesión actual del usuario y el temario
    const { data: currentSession, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, context_data')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    if (sessionError || !currentSession) {
      return { error: "No se encontró la sesión de chat." };
    }

    // Obtener el contenido del temario
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select('content')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return { error: "No se encontró el temario." };
    }

    const topicContent = topic.content;

    // ********** Lógica de Llamada a la IA (Modificada) **********

    // 3. Construir el historial y el System Prompt
    // El System Prompt de Gemini se pasa como una opción separada, no como un mensaje 'system' en el historial.

    const systemPrompt = `Eres un tutor experto en ${topicContent}. 
                          Tu objetivo es guiar al alumno a través del temario, responder sus dudas
                          y evaluar su progreso.`;

    // Mapear el historial guardado (que usa 'user' y 'assistant') a la estructura Content de Gemini ('user' y 'model')
    const mappedContext: Content[] = (currentSession.context_data || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Agregar el nuevo mensaje del alumno
    const userMessagePart: Content = {
        role: 'user',
        parts: [{ text: newMessage }],
    };
    const messagesToSend: Content[] = [...mappedContext, userMessagePart];

    // 4. Llamada a la API de la IA (Gemini)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Modelo rápido para hackathon
        contents: messagesToSend,
        systemInstruction: systemPrompt,
    } as any);

    const aiResponse = response.text || "Lo siento, no pude procesar tu solicitud con Gemini.";

    // 5. Actualizar el contexto en la DB
    // NOTA: Asegúrate de guardar los mensajes en el formato que usará tu UI (probablemente 'user'/'assistant')
    const newContext: ConversationMessage[] = [
        ...(currentSession.context_data || []),
        { role: 'user', content: newMessage },
        { role: 'assistant', content: aiResponse }, // Usar 'assistant' para guardar en DB/mostrar en UI
    ];

    // Guardar el nuevo contexto en la base de datos
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({ context_data: newContext })
      .eq('id', currentSession.id);

    if (updateError) {
      return { error: "Error al guardar el contexto: " + updateError.message };
    }

    // 6. Devolver la respuesta de la IA
    return { response: aiResponse, fullContext: newContext };
  } catch (error: any) {
    return { error: error.message || "Error al procesar el mensaje.", response: undefined, fullContext: [] };
  }
}