-- Archivo: schema.sql
-- Este archivo contiene el esquema de base de datos necesario para la aplicación

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario de prueba (DUMMY_USER_ID)
INSERT INTO users (id, email, password_hash) 
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'hashed_password')
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla de temas/temarios
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tema de prueba (TOPIC_ID = 1)
INSERT INTO topics (id, title, content, description)
VALUES (1, 'Fundamentos de JavaScript', 'Variables, tipos de datos, funciones, objetos, async/await', 'Curso introductorio a JavaScript')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  context_data JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_topic_id ON chat_sessions(topic_id);
