# Frontend Web - Sistema de Reservaciones y Préstamos FISI UNMSM

Interfaz de usuario moderna, responsive y accesible construida con React 18 y Vite, siguiendo la identidad visual institucional de la Facultad de Ingeniería de Sistemas e Informática (UNMSM).

---

## 🎨 Características de Diseño y UI/UX

- **Diseño Visual:** Tipografía *Plus Jakarta Sans*, paleta de azules institucionales UNMSM/FISI (`#0f2942`, `#1e6091`, `#0284c7`), tarjetas elevadas y micro-interacciones.
- **Formularios Optimizados:**
  - Registro a 2 columnas con validación dinámica y selección de rol.
  - Login interactivo con feedback visual de intentos fallidos (1 de 3, 2 de 3).
  - Alerta distintiva de cuenta bloqueada.
  - Flujo de recuperación de contraseña en 2 pasos con código de seguridad OTP.
- **Portal del Usuario (Dashboard):** Identificación de rol con badges temáticos, tarjetas informativas y preparación para módulos de la Iteración 2.

---

## 📁 Estructura del Frontend

```
frontend/
├── src/
│   ├── assets/           # Recursos estáticos y logotipos
│   ├── components/       # Componentes de vistas
│   │   ├── Login.jsx & Login.css
│   │   ├── Register.jsx & Register.css
│   │   ├── ForgotPassword.jsx & ForgotPassword.css
│   │   └── Dashboard.jsx & Dashboard.css
│   ├── services/         # Cliente HTTP hacia la API REST (api.js)
│   ├── App.jsx           # Ruteo y control de estado de sesión
│   ├── main.jsx          # Punto de entrada de React
│   └── index.css         # Estilos globales y reset CSS
├── e2e-screenshots/      # Capturas generadas por las pruebas E2E de Playwright
├── playwright-runner.js  # Script de pruebas automatizadas E2E visuales
├── .env                  # Variables de entorno
├── vite.config.js        # Configuración de Vite y proxy local
└── package.json
```

---

## ⚙️ Variables de Entorno

Archivo `.env` en la raíz de `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CONVEX_URL=https://proficient-wildebeest-749.convex.cloud
```

---

## 🚀 Comandos

### 1. Iniciar servidor de desarrollo
```bash
npm install
npm run dev
```
*Disponible en: `http://localhost:5173`.*

### 2. Compilar para producción y verificar linter
```bash
npm run build
npm run lint
```

### 3. Ejecutar pruebas automatizadas E2E con Playwright (Navegador Visible)
```bash
npm run test:e2e
```
o
```bash
node playwright-runner.js
```

> **Nota:** Este comando lanza Chromium en modo visible (`headless: false`) con una pausa de 1 segundo entre acciones (`slowMo: 1000`) para que puedas observar todo el recorrido en tu pantalla y genera automáticamente las capturas en `e2e-screenshots/`.
