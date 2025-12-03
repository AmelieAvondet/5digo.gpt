// Archivo: app/admin/topics/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { getTopics, createTopic, updateTopic, deleteTopic } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/action';

interface Topic {
  id: number;
  title: string;
  content: string;
  description: string | null;
  created_at: string;
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', description: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  // Cargar temarios al montar
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    const result = await getTopics();
    if (result.error) {
      setError(result.error);
    } else {
      setTopics(result.topics || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Título y contenido son requeridos');
      return;
    }

    const form = new FormData();
    form.set('title', formData.title);
    form.set('content', formData.content);
    form.set('description', formData.description);

    const result = await createTopic(form);
    if (result.error) {
      setError(result.error);
    } else {
      setFormData({ title: '', content: '', description: '' });
      await loadTopics();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.title || !formData.content) {
      setError('Todos los campos son requeridos');
      return;
    }

    const form = new FormData();
    form.set('title', formData.title);
    form.set('content', formData.content);
    form.set('description', formData.description);

    const result = await updateTopic(editingId, form);
    if (result.error) {
      setError(result.error);
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', description: '' });
      await loadTopics();
    }
  };

  const handleDelete = async (topicId: number) => {
    if (confirm('¿Seguro que deseas eliminar este temario?')) {
      const result = await deleteTopic(topicId);
      if (result.error) {
        setError(result.error);
      } else {
        await loadTopics();
      }
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setFormData({
      title: topic.title,
      content: topic.content,
      description: topic.description || '',
    });
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
          <p className="text-sm text-gray-600">Gestión de Temarios</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Editar Temario' : 'Crear Nuevo Temario'}
          </h2>

          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Fundamentos de JavaScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descripción breve del temario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                placeholder="Contenido del temario (puede incluir temas, subtemas, etc.)"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', content: '', description: '' });
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Temarios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Temarios Existentes</h2>

          {loading ? (
            <p className="text-gray-600">Cargando temarios...</p>
          ) : topics.length === 0 ? (
            <p className="text-gray-600">No hay temarios creados aún.</p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{topic.content}</p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    ID: {topic.id} | Creado: {new Date(topic.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
