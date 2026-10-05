-- ==========================================================
-- SISTEMA DE RESERVAS Y PRÉSTAMOS - FISI UNMSM
-- Datos de prueba iniciales (Seeds)
-- Contraseña para todos los usuarios de prueba: 12345678
-- Hash bcrypt: $2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC
-- ==========================================================

INSERT INTO usuarios (codigo_dni, nombre, correo, password_hash, rol, codigo_trabajador, estado_validacion, intentos_fallidos, bloqueado)
VALUES
    ('20200101', 'Juan Alumno Pérez', 'juan.alumno@unmsm.edu.pe', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'alumno', NULL, 'aprobado', 0, FALSE),
    ('10102020', 'Dra. María Docente López', 'maria.docente@unmsm.edu.pe', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'docente', NULL, 'aprobado', 0, FALSE),
    ('08901234', 'Carlos Admin FISI', 'carlos.admin@unmsm.edu.pe', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'administrativo', 'ADM-FISI-001', 'aprobado', 0, FALSE),
    ('07890123', 'Lic. Roberto Pendiente', 'roberto.admin@unmsm.edu.pe', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'administrativo', 'ADM-FISI-088', 'pendiente', 0, FALSE),
    ('71234567', 'Pedro Foráneo García', 'pedro.foraneo@gmail.com', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'foraneo', NULL, 'aprobado', 0, FALSE),
    ('79876543', 'Ana Externa Quispe', 'ana.externa@gmail.com', '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC', 'externo', NULL, 'aprobado', 0, FALSE)
ON CONFLICT (codigo_dni) DO NOTHING;
