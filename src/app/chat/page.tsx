// Archivo: app/chat/page.tsx (Componente de Interfaz de Chat)

"use client";

import React, { useState, useEffect } from 'react';
import { chatWithAI } from './action';
import { loadContextData, loadAvailableTopics } from './loader';
import { useFormStatus } from 'react-dom'; // Para deshabilitar el botón
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/action';

type Message = { role: 'user' | 'assistant'; content: string };
type Topic = { id: number; title: string };

// Componente para el estado de carga del formulario
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 transition-colors">
            {pending ? 'Enviando...' : 'Enviar'}
        </button>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<number>(1);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [topicLoading, setTopicLoading] = useState(false);
    const router = useRouter();

    // Cargar temas disponibles al montar
    useEffect(() => {
        loadTopics();
    }, []);

    // Cargar contexto cuando cambia el tema
    useEffect(() => {
        loadContextForTopic(selectedTopic);
    }, [selectedTopic]);

    const loadTopics = async () => {
        const result = await loadAvailableTopics();
        if (result.topics.length > 0) {
            setTopics(result.topics);
            setSelectedTopic(result.topics[0].id);
        } else {
            // Temas por defecto
            setTopics([
                { id: 1, title: 'Fundamentos de JavaScript' },
                { id: 2, title: 'React Basics' },
                { id: 3, title: 'TypeScript Intro' },
            ]);
        }
        setLoading(false);
    };

    const loadContextForTopic = async (topicId: number) => {
        setTopicLoading(true);
        const result = await loadContextData(topicId);
        if (result.context && result.context.length > 0) {
            setMessages(result.context);
        } else {
            setMessages([]);
        }
        setTopicLoading(false);
    };

    // Handler para enviar el formulario y el mensaje
    const handleSubmit = async (formData: FormData) => {
        const newMessage = formData.get("message") as string;
        if (!newMessage.trim()) return;

        // Mostrar el mensaje del usuario inmediatamente
        const userMessage: Message = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMessage]);

        // Limpiar input
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) form.reset();

        // Llamar a la Server Action
        const result = await chatWithAI(selectedTopic, newMessage);

        if (result.error) {
            alert(result.error);
            // Remover el mensaje del usuario si falló
            setMessages(prev => prev.slice(0, -1)); 
            return;
        }

        // Añadir la respuesta de la IA
        setMessages(result.fullContext || []);
    };

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tutor IA</h1>
                    <p className="text-sm text-gray-600">Aprende con inteligencia artificial</p>
                </div>
                <div className="flex gap-4 items-center">
                    <a
                        href="/admin/topics"
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                        Admin
                    </a>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                {/* Sidebar de temas */}
                <div className="w-64 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Temarios</h2>
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando temarios...</p>
                    ) : (
                        <div className="space-y-2">
                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    disabled={topicLoading}
                                    className={`w-full text-left p-3 rounded-lg transition-colors disabled:opacity-50 ${
                                        selectedTopic === topic.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    {topic.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col max-w-4xl">
                    <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-white rounded-lg shadow-md mb-4">
                        {topicLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-400 text-lg">Cargando contexto...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-400 text-lg">Comienza a hacer preguntas sobre {topics.find(t => t.id === selectedTopic)?.title || 'este tema'}</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                            msg.role === 'user'
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Input Form */}
                    <form action={handleSubmit} className="flex gap-2 bg-white p-4 rounded-lg shadow-md">
                        <input
                            name="message"
                            type="text"
                            placeholder="Pregunta sobre el tema..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="off"
                        />
                        <SubmitButton />
                    </form>
                </div>
            </div>
        </div>
    );
}