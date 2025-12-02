// Archivo: app/register/page.tsx
"use client";

import { registerUser } from '@/app/action'; // Asegúrate de que la ruta sea correcta
import { useFormStatus } from 'react-dom';
import { FormEvent, useState } from 'react';

function RegisterButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-green-500 text-white p-2 rounded">
            {pending ? 'Registrando...' : 'Registrarse'}
        </button>
    );
}

export default function RegisterPage() {
    const [error, setError] = useState<string>("");

    // La acción de formulario llama a registerUser
    const handleSubmit = async (formData: FormData) => {
        const result = await registerUser(formData);
        if (result?.error) {
            setError(result.error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Registro de Alumno</h2>
            <form action={handleSubmit} className="space-y-4">
                <input name="email" type="email" placeholder="Email" required 
                       className="w-full p-2 border rounded" />
                <input name="password" type="password" placeholder="Contraseña" required 
                       className="w-full p-2 border rounded" />
                <RegisterButton />
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}