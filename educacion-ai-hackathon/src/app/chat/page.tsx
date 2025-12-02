// Archivo: app/chat/page.tsx (Componente de Interfaz de Chat)

"use client";

import React, { useState } from 'react';
import { chatWithAI } from './action';
import { useFormStatus } from 'react-dom'; // Para deshabilitar el botón

type Message = { role: 'user' | 'assistant'; content: string };

// Componente para el estado de carga del formulario
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-500 text-white p-2 rounded-lg disabled:bg-gray-400">
            {pending ? 'Enviando...' : 'Enviar'}
        </button>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    // NOTA: El userId debe obtenerse del estado de autenticación real
    const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001"; 
    const TOPIC_ID = 1;

    // Handler para enviar el formulario y el mensaje
    const handleSubmit = async (formData: FormData) => {
        const newMessage = formData.get("message") as string;
        if (!newMessage.trim()) return;

        // Mostrar el mensaje del usuario inmediatamente
        const userMessage: Message = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMessage]);

        // Llamar a la Server Action
        const result = await chatWithAI(DUMMY_USER_ID, TOPIC_ID, newMessage);

        if (result.error) {
            alert(result.error);
            // Remover el mensaje del usuario si falló
            setMessages(prev => prev.slice(0, -1)); 
            return;
        }

        // Añadir la respuesta de la IA
        const aiMessage: Message = { role: 'assistant', content: result.response };
        setMessages(result.fullContext.filter((msg: Message) => msg.role !== 'system'));
    };

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Tutor de IA: Fundamentos de JS</h1>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 border p-3 rounded-lg bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-green-100 self-start text-left'}`}>
                        <p className="font-semibold">{msg.role === 'user' ? 'Tú' : 'Tutor'}</p>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </div>
            
            <form action={handleSubmit} className="flex gap-2">
                <input
                    name="message"
                    type="text"
                    placeholder="Pregunta sobre el temario..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
                    autoComplete="off"
                />
                <SubmitButton />
            </form>
        </div>
    );
}