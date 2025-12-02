# Configuración de Base de Datos - Educación AI Hackathon

## 📋 Checklist de Configuración

### 1. ✅ Variables de Entorno
Asegúrate de que `.env.local` contenga (SIN comillas):
```env
NEXT_PUBLIC_SUPABASE_URL=https://aihjbewzxaoqwthuzoag.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyD1U...
```

### 2. ✅ Crear Tablas en Supabase

Ejecuta el contenido de `schema.sql` en el SQL Editor de Supabase:

#### Opción A: Supabase Dashboard
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `schema.sql`
3. Click en "Run"

#### Opción B: Desde terminal (si tienes supabase CLI)
```bash
supabase db push
```

### 3. ✅ Verificar Datos de Prueba

En Supabase Dashboard → Table Editor:

#### Tabla `users`:
Debe existir:
- `id`: `00000000-0000-0000-0000-000000000001`
- `email`: `test@example.com`
- `password_hash`: cualquier valor

#### Tabla `topics`:
Debe existir:
- `id`: `1`
- `title`: `Fundamentos de JavaScript`
- `content`: contenido del tema

#### Tabla `chat_sessions`:
Se creará automáticamente cuando se envíe el primer mensaje.

### 4. ✅ Restringir Acceso RLS (Row Level Security)

Para desarrollo, puedes desabilitar RLS temporalmente:
1. Tabla `users` → RLS → Disabled
2. Tabla `topics` → RLS → Disabled
3. Tabla `chat_sessions` → RLS → Disabled

> ⚠️ En producción, configurar RLS apropiadamente

### 5. ✅ Iniciar Aplicación

```bash
npm install
npm run dev
```

Visita: `http://localhost:3000/chat`

## 🐛 Depuración

Si hay errores, revisa la consola del servidor para logs `[DEBUG]` y `[ERROR]`:

```
[DEBUG] Iniciando chatWithAI: userId=..., topicId=...
[DEBUG] Búsqueda de sesión: ...
[ERROR] Error al crear sesión: ...
```

## 🔗 Referencias

- Supabase Docs: https://supabase.com/docs
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Google Gemini API: https://ai.google.dev
