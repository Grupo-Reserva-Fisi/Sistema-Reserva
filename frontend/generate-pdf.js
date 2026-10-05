import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, 'e2e-screenshots');
const outputPdfPath = path.resolve(__dirname, '../docs/Informe_Tecnico_HU01_HU02_FISI.pdf');

function getImageBase64(filename) {
  const fullPath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[Aviso] Imagen no encontrada: ${fullPath}`);
    return '';
  }
  const buffer = fs.readFileSync(fullPath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function generatePDF() {
  console.log('--- GENERANDO INFORME TÉCNICO EN FORMATO PDF (HU-U01 y HU-U02) ---');

  const img01 = getImageBase64('01_login_view.png');
  const img02 = getImageBase64('02_register_view.png');
  const img03 = getImageBase64('03_register_success.png');
  const img04 = getImageBase64('04_dashboard_docente.png');
  const img05 = getImageBase64('05_account_blocked.png');
  const img06 = getImageBase64('06_forgot_password_step1.png');
  const img07 = getImageBase64('07_forgot_password_step2.png');
  const img08 = getImageBase64('08_password_reset_success.png');
  const img09 = getImageBase64('09_dashboard_post_unblock.png');
  const img10 = getImageBase64('10_registro_admin_pendiente.png');
  const img11 = getImageBase64('11_login_bloqueado_pendiente.png');
  const img12 = getImageBase64('12_panel_validacion_admin.png');
  const img13 = getImageBase64('13_aprobacion_exitosa_admin.png');
  const img14 = getImageBase64('14_dashboard_admin_aprobado.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Técnico - HU-U01 y HU-U02</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 10.5pt;
      background: #ffffff;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Portada */
    .cover-container {
      height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 2px solid #0e2b5c;
      border-radius: 12px;
      padding: 40px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      position: relative;
    }

    .cover-header {
      text-align: center;
      border-bottom: 3px solid #b91c1c;
      padding-bottom: 25px;
    }

    .university-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0e2b5c;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .faculty-title {
      font-size: 12pt;
      font-weight: 600;
      color: #b91c1c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .course-title {
      font-size: 10pt;
      font-weight: 500;
      color: #64748b;
    }

    .cover-body {
      text-align: center;
      margin: 40px 0;
    }

    .badge-report {
      display: inline-block;
      background-color: #0e2b5c;
      color: #ffffff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .doc-main-title {
      font-size: 22pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 15px;
    }

    .doc-subtitle {
      font-size: 12pt;
      color: #475569;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.4;
    }

    .cover-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-size: 9pt;
      color: #334155;
    }

    .footer-col {
      line-height: 1.6;
    }

    /* Estilos Generales de Contenido */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0e2b5c;
      border-bottom: 2px solid #0e2b5c;
      padding-bottom: 6px;
      margin-top: 20px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #b91c1c;
      margin-top: 16px;
      margin-bottom: 10px;
      border-left: 4px solid #b91c1c;
      padding-left: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Cajas y Alertas */
    .callout {
      background-color: #f1f5f9;
      border-left: 4px solid #0e2b5c;
      padding: 10px 14px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 9.5pt;
    }

    .callout-success {
      background-color: #f0fdf4;
      border-left-color: #16a34a;
    }

    .callout-warning {
      background-color: #fefce8;
      border-left-color: #ca8a04;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }

    th {
      background-color: #0e2b5c;
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.04em;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Capturas y Figuras */
    .figure-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      margin: 14px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .figure-card img {
      width: 100%;
      height: auto;
      max-height: 340px;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      display: block;
      margin: 0 auto;
    }

    .figure-caption {
      margin-top: 8px;
      font-size: 8.5pt;
      color: #475569;
      text-align: center;
      font-weight: 500;
    }

    .figure-caption strong {
      color: #0e2b5c;
    }

    .badge-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-approved { background-color: #dcfce7; color: #15803d; }
    .badge-pending { background-color: #fef3c7; color: #b45309; }
    .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
    .badge-info { background-color: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="cover-container">
    <div class="cover-header">
      <div class="university-title">Universidad Nacional Mayor de San Marcos</div>
      <div class="faculty-title">Facultad de Ingeniería de Sistemas e Informática</div>
      <div class="course-title">Desarrollo de Aplicaciones Web — Semestre 2026-2</div>
    </div>

    <div class="cover-body">
      <div class="badge-report">Informe de Implementación y Aseguramiento de Calidad</div>
      <h1 class="doc-main-title">Sistema de Reservas y Préstamos FISI</h1>
      <p class="doc-subtitle">
        Documentación Técnica, Validación Integral de Criterios y Pruebas End-to-End para las Historias de Usuario:
        <br><br>
        <strong>HU-U01:</strong> Autenticación, Registro y Recuperación OTP
        <br>
        <strong>HU-U02:</strong> Registro y Validación de Personal Administrativo
      </p>
    </div>

    <div class="cover-footer">
      <div class="footer-col">
        <strong>Equipo de Desarrollo:</strong> Grupo 5<br>
        <strong>Organización GitHub:</strong> Grupo-Reserva-Fisi<br>
        <strong>Repositorio:</strong> Sistema-Reserva<br>
        <strong>Rama de Entrega:</strong> <code>feature/HU-U02-registro-admin</code>
      </div>
      <div class="footer-col" style="text-align: right;">
        <strong>Convex Cloud Deployment:</strong> <code>proficient-wildebeest-749</code><br>
        <strong>Base de Datos Portátil:</strong> SQLite / PostgreSQL DDL<br>
        <strong>Entorno de Pruebas:</strong> Playwright Chromium E2E<br>
        <strong>Fecha:</strong> Octubre 2026
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECCIÓN 1: ARQUITECTURA -->
  <h1>1. Resumen Ejecutivo y Arquitectura Técnica</h1>
  <p>
    El <strong>Sistema de Reservas de Espacios y Préstamos de Recursos de la FISI - UNMSM</strong> es una plataforma integral orientada a optimizar la asignación y custodia de laboratorios, auditorios y equipos audiovisuales para estudiantes, docentes y personal institucional.
  </p>
  <p>
    El presente documento detalla la culminación e implementación de las dos primeras historias de usuario fundamentales del módulo de <em>Usuarios y Accesos (U)</em>, abarcando desde la capa visual, la lógica de negocio, la arquitectura de doble persistencia, hasta la suite automatizada de pruebas visuales y de integración.
  </p>

  <div class="callout callout-success">
    <strong>Estado de Calidad:</strong> El sistema cuenta con <strong>20 de 20 pruebas de backend superadas al 100%</strong> (11 pruebas de HU-U01 y 9 pruebas de HU-U02), además de <strong>10 pruebas E2E visuales</strong> ejecutadas con Playwright con navegador visible (headless: false) y registro en video full HD.
  </div>

  <h2>1.1 Stack Tecnológico y Componentes</h2>
  <table>
    <thead>
      <tr>
        <th>Capa</th>
        <th>Tecnología</th>
        <th>Rol y Características Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>React 18 + Vite</td>
        <td>Interfaz reactiva, modular y ligera. Identidad visual institucional UNMSM (paleta azul noche <code>#0e2b5c</code>, rojo carmesí <code>#b91c1c</code>). Vistas divididas en Login, Registro, Recuperación de Clave y Panel de Validación.</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Node.js + Express</td>
        <td>Servicio REST estructurado por capas (Rutas, Controladores, Modelos y Servicios). Generación de tokens JWT seguros y encriptación de claves con <code>bcryptjs</code> (10 salt rounds).</td>
      </tr>
      <tr>
        <td><strong>Persistencia Cloud</strong></td>
        <td>Convex Cloud Database</td>
        <td>Base de datos en tiempo real de producción (<code>proficient-wildebeest-749</code>). Esquema fuertemente tipado con índices por correo, DNI y estado de validación.</td>
      </tr>
      <tr>
        <td><strong>Persistencia Portátil</strong></td>
        <td>SQLite (Fallback) / PostgreSQL</td>
        <td>Esquema DDL estandarizado en <code>backend/database/schema.sql</code> y semillas en <code>seeds.sql</code>. Se activa automáticamente sin dependencias externas si no hay conexión a la nube.</td>
      </tr>
      <tr>
        <td><strong>Mailing / OTP</strong></td>
        <td>Nodemailer + Ethereal SMTP</td>
        <td>Servicio de despacho de códigos de recuperación OTP de 6 dígitos y notificaciones de estado administrativo. Compatible con Gmail SMTP con credenciales de aplicación (2FA).</td>
      </tr>
      <tr>
        <td><strong>Pruebas E2E</strong></td>
        <td>Playwright Chromium</td>
        <td>Ejecución de flujos completos sobre el DOM con capturas de pantalla automáticas, soporte interactivo con diálogos de confirmación y pausas <code>slowMo</code>.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECCIÓN 2: HU-U01 -->
  <h1>2. HU-U01: Inicio de Sesión, Registro y Recuperación OTP</h1>
  
  <h2>2.1 Especificación de la Historia</h2>
  <p>
    <strong>Como:</strong> Usuario de la comunidad universitaria (alumno, docente, administrativo, foráneo o externo).<br>
    <strong>Quiero:</strong> Registrarme en el sistema, autenticarme de forma segura y contar con un mecanismo de recuperación de contraseña con doble factor de seguridad.<br>
    <strong>Para:</strong> Acceder a los servicios de reserva y préstamo de recursos de la FISI manteniendo protegidas mis credenciales.
  </p>

  <h2>2.2 Criterios de Aceptación Implementados</h2>
  <ul>
    <li><strong>CA-01: Autenticación Unificada:</strong> El usuario puede iniciar sesión indistintamente con su Código Universitario/DNI o su Correo Institucional, validando su clave encriptada con Bcrypt.</li>
    <li><strong>CA-02: Registro con Clasificación de Rol:</strong> Formulario responsivo a dos columnas que permite registrarse seleccionando el rol correspondiente dentro de la universidad.</li>
    <li><strong>CA-03: Mitigación de Ataques de Fuerza Bruta:</strong> Al tercer intento consecutivo de contraseña errónea, la cuenta se bloquea automáticamente por seguridad (flag <code>bloqueado: true</code>).</li>
    <li><strong>CA-04: Recuperación con Doble Factor (2FA):</strong> Para solicitar el restablecimiento, el sistema exige ingresar el DNI y el correo electrónico. Si el correo no coincide con el registrado para dicho DNI, la solicitud es rechazada para impedir suplantación.</li>
    <li><strong>CA-05: Código OTP y Desbloqueo:</strong> Se genera un código OTP numérico de 6 dígitos con 15 minutos de vigencia enviado por correo. Tras verificar el OTP, el usuario ingresa su nueva contraseña y la cuenta se desbloquea de inmediato.</li>
  </ul>

  <h2>2.3 Evidencias Visuales de Implementación (HU-U01)</h2>

  <div class="figure-card avoid-break">
    <img src="${img01}" alt="Pantalla de Login">
    <div class="figure-caption">
      <strong>Figura 1 (HU-U01):</strong> Pantalla de inicio de sesión oficial con estética institucional UNMSM, enlace a registro y recuperación de contraseña.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img02}" alt="Formulario de Registro">
    <div class="figure-caption">
      <strong>Figura 2 (HU-U01):</strong> Formulario de Registro a 2 columnas con validación en vivo de contraseñas y selector de roles institucionales.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="figure-card avoid-break">
    <img src="${img03}" alt="Registro Exitoso">
    <div class="figure-caption">
      <strong>Figura 3 (HU-U01):</strong> Confirmación de cuenta creada exitosamente y redirección automática hacia la pantalla de autenticación.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img04}" alt="Dashboard Docente">
    <div class="figure-caption">
      <strong>Figura 4 (HU-U01):</strong> Dashboard principal tras login exitoso, mostrando nombre, correo, estado activo y badge de rol "Docente UNMSM".
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img05}" alt="Cuenta Bloqueada por Seguridad">
    <div class="figure-caption">
      <strong>Figura 5 (HU-U01):</strong> Bloqueo automático de cuenta tras 3 intentos fallidos con banner de alerta y enlace directo a recuperación.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="figure-card avoid-break">
    <img src="${img06}" alt="Paso 1: Solicitud con Doble Factor">
    <div class="figure-caption">
      <strong>Figura 6 (HU-U01):</strong> Paso 1 de Recuperación: Validación de Doble Factor (Código/DNI y Correo Vinculado) para prevenir suplantación.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img07}" alt="Paso 2: Código OTP y Nueva Clave">
    <div class="figure-caption">
      <strong>Figura 7 (HU-U01):</strong> Paso 2 de Recuperación: Ingreso del Código OTP de 6 dígitos enviado por correo y confirmación de nueva contraseña.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img08}" alt="Desbloqueo y Clave Restablecida">
    <div class="figure-caption">
      <strong>Figura 8 (HU-U01):</strong> Banner de confirmación de contraseña restablecida exitosamente y desbloqueo inmediato de la cuenta de usuario.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="figure-card avoid-break">
    <img src="${img09}" alt="Reingreso Exitoso al Dashboard">
    <div class="figure-caption">
      <strong>Figura 9 (HU-U01):</strong> Reingreso al sistema con las nuevas credenciales verificando el restablecimiento total del acceso.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECCIÓN 3: HU-U02 -->
  <h1>3. HU-U02: Registro y Validación de Personal Administrativo</h1>

  <h2>3.1 Especificación de la Historia</h2>
  <p>
    <strong>Como:</strong> Administrador Superior / Postulante Administrativo de la FISI.<br>
    <strong>Quiero:</strong> Que el registro de personal administrativo requiera un código de trabajador acreditado y pase por una aprobación previa antes de conceder privilegios.<br>
    <strong>Para:</strong> Salvaguardar la seguridad de los recursos de la facultad, garantizando que sólo personal autorizado administre solicitudes y espacios.
  </p>

  <h2>3.2 Detalle de los 5 Criterios de Aceptación Oficiales</h2>
  <table>
    <thead>
      <tr>
        <th>N°</th>
        <th>Criterio de Aceptación</th>
        <th>Implementación y Estado Técnico</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1</strong></td>
        <td><strong>Código de Trabajador Obligatorio:</strong> El registro con rol administrativo debe solicitar obligatoriamente el código o documento laboral.</td>
        <td>Al seleccionar rol "Personal Administrativo", el frontend despliega condicionalmente el campo <code>#codigoTrabajador</code>. En backend se valida que no esté vacío, retornando <code>400 Bad Request</code> si se omite.</td>
        <td><span class="badge-status badge-approved">Implementado</span></td>
      </tr>
      <tr>
        <td><strong>2</strong></td>
        <td><strong>Estado Inicial Pendiente y Bloqueo:</strong> La cuenta se crea en estado "pendiente" y no puede iniciar sesión hasta ser validada.</td>
        <td>Se almacena en base de datos con <code>estado_validacion: 'pendiente'</code>. Si el usuario intenta loguearse, el endpoint <code>/api/auth/login</code> bloquea el acceso con <code>HTTP 403 Forbidden</code> y muestra un banner ambar explicativo.</td>
        <td><span class="badge-status badge-approved">Implementado</span></td>
      </tr>
      <tr>
        <td><strong>3</strong></td>
        <td><strong>Bandeja de Validación de Personal:</strong> Los administradores deben contar con un panel donde visualizar y procesar las solicitudes en espera.</td>
        <td>Componente <code>ValidacionPersonal.jsx</code> conectado al endpoint protegido <code>GET /api/admin/pendientes</code> con verificación de rol JWT (<code>verifyRole('administrativo')</code>). Presenta tabla con DNI, correo, código de trabajador y fecha.</td>
        <td><span class="badge-status badge-approved">Implementado</span></td>
      </tr>
      <tr>
        <td><strong>4</strong></td>
        <td><strong>Aprobación y Activación de Permisos:</strong> Al aprobar, el usuario adquiere privilegios de rol administrativo y recibe notificación por correo.</td>
        <td>Endpoint <code>PUT /api/admin/usuarios/:id/aprobar</code> actualiza en Convex Cloud y SQLite a <code>estado_validacion: 'aprobado'</code> y despacha notificación por correo. El usuario puede iniciar sesión inmediatamente.</td>
        <td><span class="badge-status badge-approved">Implementado</span></td>
      </tr>
      <tr>
        <td><strong>5</strong></td>
        <td><strong>Rechazo Motivado y Notificación:</strong> El administrador puede rechazar una solicitud ingresando un motivo obligatorio, notificando al solicitante.</td>
        <td>Modal interactivo en el panel para ingresar el motivo. Endpoint <code>PUT /api/admin/usuarios/:id/rechazar</code> persiste el motivo y despacha correo. Al intentar loguearse, el usuario ve el banner rojo con el motivo exacto de la denegación.</td>
        <td><span class="badge-status badge-approved">Implementado</span></td>
      </tr>
    </tbody>
  </table>

  <h2>3.3 Evidencias Visuales de Implementación (HU-U02)</h2>

  <div class="figure-card avoid-break">
    <img src="${img10}" alt="Registro Administrativo Pendiente">
    <div class="figure-caption">
      <strong>Figura 10 (HU-U02 - Criterio 1 y 2):</strong> Registro con Código de Trabajador obligatorio (<code>ADM-FISI-XXXX</code>) y aviso informando que la cuenta entra en estado PENDIENTE de validación.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="figure-card avoid-break">
    <img src="${img11}" alt="Login Bloqueado por Cuenta Pendiente">
    <div class="figure-caption">
      <strong>Figura 11 (HU-U02 - Criterio 2):</strong> Intento de login del administrativo no validado: el sistema bloquea el acceso con HTTP 403 y muestra el banner explicativo en color ámbar.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img12}" alt="Panel de Validación de Personal">
    <div class="figure-caption">
      <strong>Figura 12 (HU-U02 - Criterio 3):</strong> Panel de Validación de Personal para el Administrador Superior, mostrando la lista de postulantes en tiempo real con sus credenciales y opciones de acción.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="figure-card avoid-break">
    <img src="${img13}" alt="Aprobación Exitosa">
    <div class="figure-caption">
      <strong>Figura 13 (HU-U02 - Criterio 4):</strong> Aprobación de la solicitud administrativa en vivo con confirmación interactiva, actualización instantánea de la tabla y despacho de correo institucional.
    </div>
  </div>

  <div class="figure-card avoid-break">
    <img src="${img14}" alt="Login Exitoso del Administrativo Aprobado">
    <div class="figure-caption">
      <strong>Figura 14 (HU-U02 - Criterio 4):</strong> Acceso concedido al nuevo personal administrativo (Lic. Javier Mendoza) mostrando su badge oficial "ADMINISTRATIVO FISI", estado activo y acceso a los módulos de gestión.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECCIÓN 4: MATRIZ DE PRUEBAS -->
  <h1>4. Matriz de Pruebas Automatizadas y Calidad</h1>
  
  <p>
    Para garantizar que no existan regresiones y que tanto el comportamiento funcional como visual cumplan estrictamente los requisitos, se ejecutaron suites de prueba en dos niveles: <strong>Pruebas de Integración de Backend</strong> y <strong>Pruebas E2E Visuales con Playwright</strong>.
  </p>

  <h2>4.1 Pruebas de Backend e Integración (20/20 Pasadas)</h2>
  <table>
    <thead>
      <tr>
        <th>Suite</th>
        <th>Código</th>
        <th>Descripción de la Prueba</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="6"><strong>HU-U01: Autenticación y OTP</strong><br><code>test-auth.js</code></td>
        <td>CP-01</td>
        <td>Endpoint <code>/api/health</code> responde HTTP 200 y status OK</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-02</td>
        <td>Registro de usuario válido retorna HTTP 201 Created</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-03</td>
        <td>Prevención de duplicados por DNI o correo retorna HTTP 409 Conflict</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-04</td>
        <td>Autenticación válida emite token JWT y datos de perfil</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-05</td>
        <td>Bloqueo automático de cuenta al superar 3 intentos fallidos (HTTP 403)</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-06</td>
        <td>Verificación de doble factor, generación de OTP y desbloqueo de clave</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td rowspan="5"><strong>HU-U02: Validación Administrativa</strong><br><code>test-hu-u02.js</code></td>
        <td>CP-07</td>
        <td>Registro administrativo sin código de trabajador es RECHAZADO (HTTP 400)</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-08</td>
        <td>Registro con código queda en estado PENDIENTE y login es BLOQUEADO (HTTP 403)</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-09</td>
        <td>Restricción de roles: Alumnos/Docentes reciben HTTP 403 en endpoints de admin</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-10</td>
        <td>Administrador consulta lista, aprueba solicitud y usuario aprobado inicia sesión</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
      <tr>
        <td>CP-11</td>
        <td>Rechazo motivado de solicitud y verificación de motivo en intento de login</td>
        <td><span class="badge-status badge-approved">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <h2>4.2 Pruebas End-to-End Visuales (Playwright Chromium)</h2>
  <p>
    El archivo <code>frontend/playwright-runner.js</code> ejecuta de forma autónoma con navegador visible (<code>headless: false</code>) los 10 escenarios críticos que abarcan el ciclo de vida completo de ambas historias:
  </p>
  <ol>
    <li><strong>TEST 1:</strong> Carga de la vista de inicio de sesión y renderizado de componentes.</li>
    <li><strong>TEST 2:</strong> Registro completo de usuario docente a 2 columnas.</li>
    <li><strong>TEST 3:</strong> Inicio de sesión e ingreso directo al Dashboard con badge de rol.</li>
    <li><strong>TEST 4:</strong> Cierre de sesión y limpieza de tokens en almacenamiento local.</li>
    <li><strong>TEST 5:</strong> Tres intentos fallidos consecutivos provocando el bloqueo automático.</li>
    <li><strong>TEST 6:</strong> Flujo de recuperación de contraseña con doble factor (DNI + Correo) y código OTP.</li>
    <li><strong>TEST 7:</strong> Registro de nuevo personal administrativo con código institucional (estado pendiente).</li>
    <li><strong>TEST 8:</strong> Intento de autenticación de cuenta pendiente confirmando el bloqueo de seguridad en pantalla.</li>
    <li><strong>TEST 9:</strong> Login con Administrador Superior, acceso al Panel de Validación y aprobación interactiva.</li>
    <li><strong>TEST 10:</strong> Inicio de sesión exitoso del administrativo recién aprobado verificando su badge y privilegios.</li>
  </ol>

  <h2>4.3 Recursos y Enlaces en el Repositorio</h2>
  <ul>
    <li><strong>Rama Git Activa:</strong> <code>feature/HU-U02-registro-admin</code></li>
    <li><strong>Video Demostrativo del Flujo Completo:</strong> <code>docs/videos/prueba_e2e_playwright_hu_u02.mp4</code></li>
    <li><strong>Galería de Capturas en Alta Resolución:</strong> <code>frontend/e2e-screenshots/</code></li>
    <li><strong>Comando para reproducir las pruebas:</strong> <code>npm run test:e2e</code> (en la carpeta <code>frontend</code>).</li>
  </ul>

</body>
</html>
  `;

  console.log('  -> Levantando Chromium headless para renderizar PDF...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Asegurar que el directorio de salida exista
  const outputDir = path.dirname(outputPdfPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('  -> Compilando archivo PDF...');
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log(`✅ ¡PDF generado con éxito en: ${outputPdfPath}!`);
}

generatePDF().catch((err) => {
  console.error('❌ Error al generar PDF:', err);
  process.exit(1);
});
