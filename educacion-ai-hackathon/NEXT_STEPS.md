# ⚡ Próximos Pasos - Guía Rápida

## 🎯 Estado del Proyecto: 73% Completado

Tienes un proyecto funcional con autenticación, chat y admin panel. Aquí está qué hacer ahora:

---

## 1️⃣ Instalar Dependencias (2 minutos)

```bash
npm install
```

Si falla, ejecuta:
```bash
npm install --force
```

Esto instalará:
- ✅ jose (para JWT)
- ✅ @supabase/supabase-js
- ✅ bcryptjs
- ✅ Todas las dependencias necesarias

---

## 2️⃣ Configurar Base de Datos (5 minutos)

### A. Ve a Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Crea un proyecto (si no tienes uno)
3. Copia la URL y la clave service role

### B. Copiar SQL a tu proyecto

1. En Supabase Dashboard → SQL Editor
2. Copia TODO el contenido de `schema.sql`
3. Pégalo en el editor SQL
4. Click en "Run"

✅ Se crearán las 3 tablas necesarias

---

## 3️⃣ Configurar Variables de Entorno (2 minutos)

Si no tienes `.env.local`, créalo copiando `.env.example`:

```bash
cp .env.example .env.local
```

Completa con tus valores reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (copia de Supabase)
GEMINI_API_KEY=AIzaSy... (de Google AI Studio)
JWT_SECRET=genera-una-clave-aleatoria-de-32-caracteres-minimo
```

---

## 4️⃣ Iniciar Desarrollo (1 minuto)

```bash
npm run dev
```

Deberías ver:
```
 ▲ Next.js 16.0.6
   - Local:         http://localhost:3000
   - Network:       http://192.168.x.x:3000
```

---

## 5️⃣ Probar la Aplicación (5 minutos)

### Registrarse
1. Ve a http://localhost:3000 (redirige a login)
2. Click en "Regístrate aquí"
3. Email: `test@example.com`
4. Contraseña: cualquiera (mín 6 caracteres)
5. Click "Registrarse"

### Inicia Sesión
1. Serás redirigido a /login
2. Usa las credenciales que acabas de crear
3. Click "Iniciar Sesión"

### Usa el Chat
1. Deberías estar en `/chat`
2. Selecciona un temario
3. Escribe una pregunta
4. ¡Recibe respuesta de Gemini!

### Panel Admin (Opcional)
1. En la página de chat, click "Admin"
2. Crea nuevos temarios
3. Edita o elimina existentes

---

## ✨ Ahora Tienes

✅ **Autenticación Real**
- Login/Register con bcrypt
- JWT en cookies HTTP-Only
- Middleware de protección

✅ **Chat Funcional**
- Múltiples temarios
- Historial persistente
- Integración con Gemini API
- Carga de contexto automática

✅ **Panel Admin**
- Crear/editar/eliminar temarios
- Gestión completa

✅ **UI Profesional**
- Responsive design
- Tailwind CSS
- Gradientes y animaciones

---

## 📋 Lo que Falta (Opcional - Para Completar 100%)

### 9. Tests Unitarios
```bash
npm install --save-dev jest @testing-library/react
npm run test
```

Escribir tests para:
- loginUser() con email/password correcto e incorrecto
- chatWithAI() validando respuesta

### 10. Variables en Producción
En Vercel → Settings → Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- JWT_SECRET (generar uno nuevo para producción)

### 11. Deploy en Vercel
```bash
npm install -g vercel
vercel deploy --prod
```

---

## 🐛 Si Algo Falla

### Error: "No se puede conectar a Supabase"
→ Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY

### Error: "Token inválido"
→ Limpia cookies (DevTools → Aplicación → Cookies) y vuelve a login

### Error: "Módulo no encontrado"
→ Ejecuta `npm install jose` específicamente

### Error: "Redirige a login infinitamente"
→ Limpia `node_modules/` y ejecuta `npm install` de nuevo

---

## 📊 Comando Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor compilado
npm run start

# Linter
npm run lint
```

---

## 🎉 ¡Listo!

Ya tienes una aplicación educativa con IA funcional. El resto es mejoras opcionales.

**Próxima demo**: Abre http://localhost:3000 y demuestra el flujo de login → chat → admin.

---

**Documentación Adicional**: Ver `README.md` para más detalles.
