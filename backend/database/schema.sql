-- ==========================================================
-- SISTEMA DE RESERVAS Y PRÉSTAMOS - FISI UNMSM
-- Script DDL para PostgreSQL
-- Iteración 1: HU-U01 (Usuarios y Accesos)
-- ==========================================================

-- 1. Creación del tipo ENUM para roles de usuario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
        CREATE TYPE rol_usuario AS ENUM (
            'alumno',
            'docente',
            'administrativo',
            'foraneo',
            'externo'
        );
    END IF;
END$$;

-- 2. Creación de la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    codigo_dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'alumno',
    fecha_registro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    token_recuperacion VARCHAR(255),
    token_expiracion BIGINT,
    codigo_trabajador VARCHAR(50),
    estado_validacion VARCHAR(20) NOT NULL DEFAULT 'aprobado' CHECK (estado_validacion IN ('aprobado', 'pendiente', 'rechazado')),
    motivo_rechazo TEXT,

    -- Restricciones de validación
    CONSTRAINT chk_codigo_dni_longitud CHECK (LENGTH(TRIM(codigo_dni)) BETWEEN 6 AND 20),
    CONSTRAINT chk_correo_formato CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3. Índices para acelerar búsquedas en autenticación y validación
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_dni ON usuarios(codigo_dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_validacion ON usuarios(estado_validacion);
