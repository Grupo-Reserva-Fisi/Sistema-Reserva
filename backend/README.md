# Backend API - Sistema de Reservaciones y Préstamos FISI UNMSM

API REST construida con Node.js y Express para la gestión de autenticación, control de accesos por roles, bloqueo por fuerza bruta y recuperación de cuentas.

---

## 🛠️ Tecnologías y Dependencias

- **Node.js (v24+)** + **Express**
- **Autenticación:** `jsonwebtoken` (JWT con firma y expiración de 8h).
- **Criptografía:** `bcryptjs` (hashing con 10 salt rounds).
- **Email:** `nodemailer` con templates HTML y fallback a Ethereal Email test links.
- **Base de Datos:**
  - **Convex Cloud (Producción):** Cliente `ConvexHttpClient` integrado en [`src/config/convexClient.js`](./src/config/convexClient.js) con queries y mutaciones en [`convex/`](./convex/).
  - **SQL Fallback (SQLite / PostgreSQL):** Conexión transparente mediante `sqlite3` o `pg` si no se detectan variables de Convex.

---

## 📁 Estructura del Backend

```
backend/
├── convex/               # Funciones de Convex (Schema, Mutations, Queries)
│   ├── schema.js
│   └── users.js
├── database/             # Scripts SQL y semillas relacionales
│   ├── schema.sql
│   └── seeds.sql
├── src/
│   ├── config/           # Clientes de BD (Convex y SQL)
│   ├── controllers/      # Controladores de lógica de negocio (authController.js)
│   ├── middlewares/      # Middlewares de validación y verificación JWT
│   ├── models/           # Abstracción dual de persistencia (userModel.js)
│   ├── routes/           # Definición de rutas REST (authRoutes.js)
│   ├── services/         # Servicios de soporte (emailService.js)
│   ├── app.js            # Configuración de Express, CORS y middleware
│   └── server.js         # Entrada principal del servidor (puerto 5000)
├── .env                  # Variables de entorno
└── package.json
```

---

## 🌐 Endpoints de la API

Base URL: `http://localhost:5000/api`

| Método | Endpoint | Descripción | Body Requerido |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Registro de nuevo usuario | `{ codigoDni, nombre, correo, password, rol, telefono? }` |
| `POST` | `/auth/login` | Inicio de sesión y control anti-fuerza bruta | `{ codigoDni, password }` |
| `POST` | `/auth/forgot-password` | Envío de código OTP de 6 dígitos al correo | `{ identificador }` *(código/DNI o correo)* |
| `POST` | `/auth/reset-password` | Validación de OTP, restablecimiento y desbloqueo | `{ identificador, token, newPassword }` |
| `GET` | `/auth/me` | Obtener perfil del usuario autenticado | Header `Authorization: Bearer <token>` |
| `GET` | `/health` | Chequeo de estado del servidor | Ninguno |

---

## ⚙️ Configuración y Variables de Entorno

Archivo `.env` en la raíz de `backend/`:

```env
PORT=5000
JWT_SECRET=supersecret_fisi_2026_jwt_token_key_unmsm
JWT_EXPIRES_IN=8h
CONVEX_DEPLOYMENT=proficient-wildebeest-749
CONVEX_URL=https://proficient-wildebeest-749.convex.cloud
CONVEX_SITE_URL=https://proficient-wildebeest-749.convex.site
```

---

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor en desarrollo con recarga automática
npm run dev

# Iniciar servidor en modo producción
npm start

# Ejecutar suite de pruebas de integración backend
npm test
```
