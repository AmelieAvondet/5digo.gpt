# 📚 Educación AI Hackathon - Guía Completa

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- Git
- Cuenta en Supabase (gratuito)
- API Key de Google Gemini o OpenAI

---

## 📋 Instalación

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd educacion-ai-hackathon
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa con tus valores:

```bash
cp .env.example .env.local
```

**`.env.local` debe contener:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-secreta
GEMINI_API_KEY=tu-api-key-gemini
JWT_SECRET=tu-secret-key-de-minimo-32-caracteres
```

### 4. Configurar Base de Datos

Ve a [Supabase Dashboard](https://app.supabase.com) y:

1. **Crear proyecto** (si no tienes uno)
2. **Ir a SQL Editor**
3. **Pegar el contenido de `schema.sql`**
4. **Ejecutar**

Esto creará las tablas: `users`, `topics`, `chat_sessions`

### 5. Iniciar desarrollo

```bash
npm run dev
```

Visita: **http://localhost:3000**

---

## 👤 Crear Usuario de Prueba

Primero, regístrate en **http://localhost:3000/register** con:
- Email: `test@example.com`
- Contraseña: cualquiera (mín. 6 caracteres)

Luego inicia sesión en **http://localhost:3000/login**

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                 # Redirige a /login
│   ├── action.ts               # Auth (login, register, logout)
│   ├── login/
│   │   └── page.tsx           # Página de login
│   ├── register/
│   │   └── page.tsx           # Página de registro
│   ├── chat/
│   │   ├── page.tsx           # Chat principal
│   │   ├── action.ts          # Server action chatWithAI
│   │   └── loader.ts          # Cargar contexto y temarios
│   └── admin/
│       ├── actions.ts         # CRUD de temarios
│       └── topics/
│           └── page.tsx       # Panel admin de temarios
├── lib/
│   └── supabase.ts            # Cliente de Supabase
├── globals.css                 # Estilos globales
├── layout.tsx                  # Layout principal
└── middleware.ts               # Protección de rutas
```

---

## 🔐 Funcionalidades de Autenticación

### Login Real
- Validación con bcrypt
- JWT en cookies HTTP-Only
- Rutas protegidas (`/chat`, `/admin`)
- Middleware automático

### Flujo
1. Usuario accede a `/` → Redirige a `/login`
2. Inicia sesión → JWT en cookie
3. Cookie se valida en `/chat` y `/admin` automáticamente
4. Cerrar sesión → JWT eliminado

---

## 💬 Chat con IA

### Características
- Múltiples temarios
- Historial persistente
- Respuestas en tiempo real
- Contexto cargado automáticamente

### API Soportadas
- **Google Gemini** (recomendado): Más rápido y flexible
- **OpenAI**: Alternativa

---

## 👨‍💼 Panel Admin

Acceso: **http://localhost:3000/admin/topics**

### Operaciones CRUD
- ✅ Crear temario
- ✅ Listar temarios
- ✅ Editar contenido
- ✅ Eliminar temario

---

## 🧪 Testing (Próximamente)

```bash
npm run test
```

Cobertura:
- `loginUser()` con credenciales válidas/inválidas
- `chatWithAI()` con respuestas correctas
- Middleware de autenticación

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| next | 16.0.6 | Framework |
| react | 19.2.0 | UI |
| @supabase/supabase-js | ^2.86.0 | Base de datos |
| @google/genai | ^1.30.0 | API Gemini |
| jose | ^5.0.0 | JWT |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| tailwindcss | ^4 | Estilos |

---

## 🚢 Deployment en Vercel

### Paso 1: Preparar
```bash
npm run build
```

### Paso 2: Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://...
SUPABASE_SERVICE_ROLE_KEY = ...
GEMINI_API_KEY = ...
JWT_SECRET = tu-secret-produccion (generar nuevo)
NODE_ENV = production
```

### Paso 3: Deploy
```bash
vercel deploy --prod
```

---

## 🔍 Debugging

### Logs en Servidor
```
[AUTH] Login exitoso para: ...
[CHAT] Iniciando chatWithAI: ...
[ADMIN] Creando nuevo temario: ...
[MIDDLEWARE] Token verificado para usuario: ...
```

Ver en terminal cuando ejecutas `npm run dev`

### Verificar JWT
```javascript
// En DevTools Console
console.log(document.cookie) // Ver JWT
```

---

## 🐛 Troubleshooting

### "No se puede conectar a Supabase"
→ Verifica `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

### "Token inválido"
→ JWT_SECRET debe ser consistente. Regenerar si cambias.

### "Módulo no encontrado: jose"
→ Ejecuta `npm install jose`

### "Redirige a login infinitamente"
→ Middleware no puede verificar token. Limpia cookies del navegador.

---

## 📈 Próximas Mejoras

- [ ] Streaming de respuestas (palabra por palabra)
- [ ] Evaluación de progreso del alumno
- [ ] Sistema de puntos
- [ ] Exportar conversaciones
- [ ] Soporte multiidioma
- [ ] Análisis de estadísticas

---

## 📞 Soporte

Si hay problemas:
1. Revisa los logs en la terminal
2. Verifica las variables de entorno
3. Asegúrate de que Supabase está configurado
4. Limpia cookies y `node_modules/`

---

**Versión**: 0.1.0  
**Última actualización**: 2 de Diciembre, 2025  
**Estado**: ✨ 73% completado
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
