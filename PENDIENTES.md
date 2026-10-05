# 📋 Lista de Pendientes y Tareas - Sistema Reserva FISI

## 🚨 Prioridad Inmediata (Configuración de Correo SMTP Real)

### 1. Activar Verificación en 2 Pasos (2FA) y Contraseña de Aplicación en Google
- **Contexto:** Actualmente el servicio de recuperación de contraseñas por correo (`nodemailer`) funciona en modo sandbox/simulación con **Ethereal Email** (imprime en consola el código OTP y el enlace de preview). Para que el correo llegue a la bandeja de entrada real de los usuarios usando la cuenta grupal `reservafisiunmsm@gmail.com`, Google exige autenticación mediante **Contraseña de Aplicación** (App Password de 16 caracteres).
- **Pasos requeridos en la cuenta `reservafisiunmsm@gmail.com`:**
  1. Entrar a [Google Account Security](https://myaccount.google.com/security).
  2. Activar **Verificación en dos pasos (2FA)** vinculando un número de teléfono celular.
  3. Una vez activado el 2FA, ir a la sección **"Contraseñas de aplicaciones"** (o buscar "App Passwords" en el buscador de la cuenta de Google).
  4. Crear una nueva clave con nombre `Sistema-Reserva-Backend`.
  5. Copiar la contraseña de 16 caracteres generada (ejemplo: `abcd efgh ijkl mnop`).
  6. Agregar al archivo `.env` del backend:
     ```env
     EMAIL_SERVICE=gmail
     EMAIL_USER=reservafisiunmsm@gmail.com
     EMAIL_PASS=abcdefghijklmnop
     ```
  7. Reiniciar el backend para que los correos OTP salgan en vivo vía Gmail.

## ✅ Historias de Usuario Implementadas

- [x] **HU-U01 - Registro e Inicio de Sesión de Usuario:**
  - Autenticación JWT, encriptación bcrypt, control anti-fuerza bruta (bloqueo al 3er fallo consecutivo), recuperación de contraseña mediante código de seguridad OTP de 6 dígitos.
- [x] **HU-U02 - Registro y Validación de Personal Administrativo:**
  - Registro con requisito adicional (código de trabajador / documento acreditador).
  - Estado `pendiente` que bloquea login administrativo hasta validación superior.
  - Panel administrativo oficial de validación (`ValidacionPersonal.jsx` y endpoints `/api/admin/*`) con acciones de Aprobar y Rechazar.
  - Registro de motivo de rechazo y notificaciones automáticas por correo electrónico para aprobación y rechazo.
  - Persistencia híbrida en tiempo real desplegada en Convex Cloud Producción (`proficient-wildebeest-749`) y SQLite.
  - Suite de 9 pruebas de integración automatizadas (`npm run test:hu2` en `backend/`).

---

## 🚀 Pendientes para la Iteración 2 (Próximos Sprints)

- [ ] **HU-R01 - Reserva de Ambientes:**
  - Modelo de datos para Áreas Deportivas, Salas de Estudio y Auditorios en Convex.
  - Validación de disponibilidad de horarios y conflictos de reserva en tiempo real.
  - Formulario de reserva con selector de fecha, hora inicio y fin.

- [ ] **HU-P01 - Préstamo de Recursos y Equipos:**
  - Catálogo de equipos (laptops, proyectores, cables HDMI, punteros láser).
  - Control de stock y estado físico del equipo (Disponible, Prestado, Mantenimiento).
  - Registro de entrega y devolución con firma o validación de DNI.

- [ ] **HU-S01 - Seguimiento y Cancelación:**
  - Vista de "Mis Reservas y Préstamos" en el Dashboard.
  - Opción de cancelación de reserva con liberación automática de horario.
  - Notificaciones por correo al confirmar o cancelar un espacio.

---

## 📌 Gestión de Repositorio y Despliegue
- [ ] Revisión del Pull Request de `feature/HU-U01-login` hacia `main`.
- [ ] Conectar el repositorio de GitHub con Convex Git Integration para despliegues continuos automáticos (CI/CD).
