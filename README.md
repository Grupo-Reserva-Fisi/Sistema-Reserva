# Sistema Web de Reservaciones y Préstamos - FISI UNMSM
**Asignatura:** Desarrollo de Aplicaciones Web (Semestre 2026-II)  
**Docente:** Prof. Nora La Serna  
**Grupo:** 5  

---

## 📌 Descripción del Proyecto
Sistema Web integral para la gestión, reservación de áreas de recreación, salas de estudio, auditorios y préstamo de recursos y equipos tecnológicos de la **Facultad de Ingeniería de Sistemas e Informática (FISI) - Universidad Nacional Mayor de San Marcos (UNMSM)**.

---

## 🚀 Iteración 1: HU-U01 - Registro, Autenticación y Seguridad de Usuarios

### Criterios y Funcionalidades Implementadas:
1. **Registro de Usuarios:**
   - Validación estricta de Código Universitario o DNI (alfanumérico de 6 a 20 caracteres).
   - Validación de formato de correo electrónico (institucional `@unmsm.edu.pe` o personal).
   - Asignación de roles del sistema: `alumno`, `docente`, `administrativo`, `foraneo`, `externo`.
   - Control de unicidad de código/DNI y correo en base de datos (HTTP 409 en duplicados).
   - Encriptación segura de contraseñas mediante algoritmo `bcrypt` (10 salt rounds).

2. **Inicio de Sesión y Control Anti-Fuerza Bruta:**
   - Autenticación mediante Código Universitario / DNI y contraseña.
   - Generación de token JWT (JSON Web Token) firmado para sesiones seguras.
   - **Mecanismo de seguridad anti-fuerza bruta:**
     - Contador de intentos fallidos en tiempo real (1 de 3, 2 de 3).
     - Al 3er intento fallido consecutivo, la cuenta se **bloquea automáticamente** (HTTP 403) y se notifica visualmente en la interfaz con badge de estado.

3. **Recuperación de Contraseña con Doble Factor (OTP):**
   - Solicitud de recuperación mediante Código/DNI o correo registrado.
   - Generación de código OTP seguro de 6 dígitos con expiración de 15 minutos.
   - Envío de código mediante servicio de correo (Nodemailer / Ethereal Email preview).
   - Validación del código OTP, actualización de contraseña, reinicio de intentos fallidos y desbloqueo automático de la cuenta.

4. **Portal del Usuario (Dashboard):**
   - Saludo personalizado y visualización dinámica de credenciales, correo y rol con badges institucionales.
   - Acceso previo a los módulos de la Iteración 2 (Reserva de Ambientes, Préstamo de Equipos y Mis Solicitudes).
   - Cierre de sesión seguro con limpieza de almacenamiento local.

5. **Diseño Visual Moderno y Responsive:**
   - Tipografía *Plus Jakarta Sans*.
   - Paleta institucional UNMSM / FISI (Azul Marino Profundo `#0f2942`, Azul Eléctrico `#1e6091`, Azul Celeste `#0284c7`).
   - Sistema de sombras sutiles, bordes redondeados (`border-radius: 12px`), micro-interacciones hover y feedback visual claro en formularios.

---

## 🛠️ Arquitectura y Tecnologías

### Frontend (`/frontend`)
- **React 18** + **Vite**
- Componentes modulares: `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `Dashboard.jsx`, `App.jsx`.
- Estilos CSS desacoplados y responsivos (`Login.css`, `Register.css`, `ForgotPassword.css`, `Dashboard.css`).
- Automatización y pruebas E2E con **Playwright** (`playwright-runner.js`).

### Backend (`/backend`)
- **Node.js (v24+)** + **Express** (Arquitectura REST por capas: Rutas, Controladores, Modelos, Servicios, Middlewares).
- **Seguridad:** `bcryptjs`, `jsonwebtoken` (JWT), `cors`, `dotenv`.
- **Servicio de Correo:** `nodemailer` con templates HTML institucionales y soporte de enlaces de vista previa Ethereal.

### Base de Datos y Persistencia Híbrida
- **Convex Cloud (Producción):** Base de datos cloud serverless en tiempo real desplegada en producción (`https://proficient-wildebeest-749.convex.cloud`).
  - Esquema en `backend/convex/schema.js` con índices `by_correo` y `by_codigo_dni`.
  - Mutaciones y queries en `backend/convex/users.js`.
- **Modo Relacional Portable (PostgreSQL / SQLite):**
  - Script DDL en `backend/database/schema.sql` y semillas en `backend/database/seeds.sql`.
  - Fallback automático: Si no hay variables de Convex configuradas, el backend opera de inmediato con SQLite local sin requerir instalación externa.

---

## 📹 Video Demostrativo y Pruebas Automatizadas (Playwright)

El repositorio incluye la grabación en video del flujo completo de la prueba E2E ejecutada con navegador visible:

- 🎬 **Video demostración:** [`docs/videos/prueba_e2e_playwright.mp4`](./docs/videos/prueba_e2e_playwright.mp4)
- 📸 **Capturas generadas:** Disponibles en [`frontend/e2e-screenshots/`](./frontend/e2e-screenshots/):
  - `01_login_view.png` — Pantalla de login inicial.
  - `02_register_view.png` — Formulario de registro a 2 columnas.
  - `03_register_success.png` — Creación exitosa de nuevo usuario.
  - `04_dashboard_docente.png` — Dashboard autenticado con rol Docente.
  - `05_account_blocked.png` — Bloqueo de cuenta tras 3 intentos fallidos.
  - `06_forgot_password_step1.png` — Solicitud de código OTP.
  - `07_forgot_password_step2.png` — Ingreso de código OTP y nueva contraseña.
  - `08_password_reset_success.png` — Confirmación de desbloqueo exitoso.
  - `09_dashboard_post_unblock.png` — Inicio de sesión tras recuperación.

### Cómo ejecutar las pruebas con navegador visible (`headless: false`):
```bash
cd Sistema-Reserva/frontend
npm run test:e2e
```
*Este comando detecta los servidores activos, abre Chromium en pantalla y ejecuta todo el flujo con pausas visuales (`slowMo`) para apreciar cada paso.*

---

## 💻 Instrucciones de Instalación y Ejecución

### 1. Variables de Entorno

**Backend (`backend/.env`):**
```env
PORT=5000
JWT_SECRET=supersecret_fisi_2026_jwt_token_key_unmsm
JWT_EXPIRES_IN=8h
CONVEX_DEPLOYMENT=proficient-wildebeest-749
CONVEX_URL=https://proficient-wildebeest-749.convex.cloud
CONVEX_SITE_URL=https://proficient-wildebeest-749.convex.site
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CONVEX_URL=https://proficient-wildebeest-749.convex.cloud
```

### 2. Iniciar el Backend
```bash
cd Sistema-Reserva/backend
npm install
npm run dev
```
*Servidor API disponible en `http://localhost:5000`.*

### 3. Iniciar el Frontend
En otra terminal:
```bash
cd Sistema-Reserva/frontend
npm install
npm run dev
```
*Aplicación web disponible en `http://localhost:5173`.*

---

## 👥 Cuentas de Prueba Pre-registradas

Todas las contraseñas son: `12345678`

| Rol | Código / DNI | Correo Electrónico | Estado |
| :--- | :--- | :--- | :--- |
| **Alumno** | `20200101` | `juan.alumno@unmsm.edu.pe` | Activo |
| **Docente** | `10102020` | `maria.docente@unmsm.edu.pe` | Activo |
| **Administrativo** | `08901234` | `carlos.admin@unmsm.edu.pe` | Activo |
| **Foráneo** | `71234567` | `pedro.foraneo@gmail.com` | Activo |
| **Externo** | `79876543` | `ana.externa@gmail.com` | Activo |
| **Prueba Verificada** | `20260001` | `reservafisiunmsm@gmail.com` | Activo |
