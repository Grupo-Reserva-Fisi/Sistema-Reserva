import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, 'e2e-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper para esperar a que un puerto responda
async function waitForPort(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) {
        return true;
      }
    } catch (e) {
      // continuar esperando
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout esperando el servicio en ${url}`);
}

async function isPortActive(url) {
  try {
    const res = await fetch(url);
    return res.ok || res.status === 404 || res.status === 200;
  } catch (e) {
    return false;
  }
}

async function runE2E() {
  console.log('=== INICIANDO PRUEBAS E2E CON PLAYWRIGHT Y VERIFICACIÓN DE CSS ===');

  let backendProc = null;
  let frontendProc = null;
  let browser = null;

  try {
    // 1. Iniciar Backend en puerto 5000 (o reutilizar si ya está activo)
    const backendRunning = await isPortActive('http://localhost:5000/api/health');
    if (backendRunning) {
      console.log('✅ Backend ya está activo en http://localhost:5000');
    } else {
      console.log('[1/5] Iniciando Backend en http://localhost:5000 ...');
      backendProc = spawn('node', ['src/server.js'], {
        cwd: path.resolve(__dirname, '../backend'),
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: '5000' }
      });

      backendProc.stdout.on('data', (d) => process.stdout.write(`[Backend] ${d}`));
      backendProc.stderr.on('data', (d) => process.stderr.write(`[Backend Error] ${d}`));

      await waitForPort('http://localhost:5000/api/health');
      console.log('✅ Backend listo y respondiendo.');
    }

    // 2. Iniciar Frontend Vite en puerto 5173 (o reutilizar si ya está activo)
    const frontendRunning = await isPortActive('http://localhost:5173');
    if (frontendRunning) {
      console.log('✅ Frontend ya está activo en http://localhost:5173');
    } else {
      console.log('[2/5] Iniciando Frontend Vite en http://localhost:5173 ...');
      frontendProc = spawn('npx', ['vite', '--port', '5173', '--strictPort'], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true,
      });

      frontendProc.stdout.on('data', (d) => process.stdout.write(`[Frontend] ${d}`));
      frontendProc.stderr.on('data', (d) => process.stderr.write(`[Frontend Error] ${d}`));

      await waitForPort('http://localhost:5173');
      console.log('✅ Frontend listo y respondiendo.');
    }

    // 3. Lanzar Playwright Chromium en modo VISIBLE (headless: false)
    console.log('[3/5] Lanzando navegador Chromium en pantalla (modo visible)...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 1000 // Pausa de 1 segundo entre acciones para que puedas observar todo el flujo
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    // TEST 1: Carga de Login y captura visual
    console.log('\n--- TEST 1: Pantalla de Login ---');
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.login-card');
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_view.png') });
    console.log('📸 Captura guardada: 01_login_view.png');

    // TEST 2: Navegación a Registro y creación de usuario nuevo
    console.log('\n--- TEST 2: Registro de Usuario ---');
    await page.click('text=Regístrate aquí');
    await page.waitForSelector('text=Crear Cuenta');
    await page.screenshot({ path: path.join(screenshotsDir, '02_register_view.png') });
    console.log('📸 Captura guardada: 02_register_view.png');

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newDni = `2026${randomNum}`;
    const newEmail = `estudiante_${randomNum}@unmsm.edu.pe`;

    await page.fill('#codigoDni', newDni);
    await page.fill('#nombre', 'Alejandro Vargas');
    await page.fill('#correo', newEmail);
    await page.selectOption('#rol', 'docente');
    await page.fill('#password', 'Docente123');
    await page.fill('#confirmPassword', 'Docente123');

    await page.click('button[type="submit"]');
    await page.waitForSelector('.success-banner');
    await page.screenshot({ path: path.join(screenshotsDir, '03_register_success.png') });
    console.log('📸 Captura guardada: 03_register_success.png');

    // Esperar redirección al Login
    await page.waitForSelector('text=Iniciar Sesión', { timeout: 5000 });

    // TEST 3: Login con usuario recién registrado
    console.log('\n--- TEST 3: Login e ingreso al Dashboard ---');
    await page.fill('#codigoDni', newDni);
    await page.fill('#password', 'Docente123');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.dashboard-layout');
    await page.screenshot({ path: path.join(screenshotsDir, '04_dashboard_docente.png') });
    console.log('📸 Captura guardada: 04_dashboard_docente.png');
    await page.waitForTimeout(2000); // Pausa para apreciar el Dashboard

    // TEST 4: Cerrar sesión
    console.log('\n--- TEST 4: Cierre de Sesión ---');
    await page.click('text=Cerrar Sesión');
    await page.waitForSelector('.login-card');
    console.log('✅ Sesión cerrada correctamente.');

    // TEST 5: Intentos fallidos y bloqueo de cuenta (3 intentos)
    console.log('\n--- TEST 5: Intentos Fallidos y Bloqueo por Seguridad ---');
    // Intento 1
    await page.fill('#codigoDni', newDni);
    await page.fill('#password', 'WrongPass1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.error-banner');
    console.log('  -> Intento 1 fallido registrado');

    // Intento 2
    await page.fill('#password', 'WrongPass2');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.error-banner');
    console.log('  -> Intento 2 fallido registrado');

    // Intento 3 -> Bloqueo
    await page.fill('#password', 'WrongPass3');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Cuenta Bloqueada');
    await page.screenshot({ path: path.join(screenshotsDir, '05_account_blocked.png') });
    console.log('📸 Captura guardada: 05_account_blocked.png');

    // TEST 6: Flujo de Recuperación de Contraseña con Doble Factor y OTP
    console.log('\n--- TEST 6: Recuperación con Doble Factor (DNI + Correo) y Código OTP ---');
    await page.click('text=Haz clic aquí para recuperar tu contraseña');
    await page.waitForSelector('text=Recuperar Contraseña');
    await page.screenshot({ path: path.join(screenshotsDir, '06_forgot_password_step1.png') });
    console.log('📸 Captura guardada: 06_forgot_password_step1.png');

    // 6.1 Prueba de seguridad: Tercero intenta con DNI pero con correo falso
    console.log('  -> Probando seguridad: Intento de suplantación con correo falso...');
    await page.fill('#codigoDni', newDni);
    await page.fill('#correo', 'atacante_falso@gmail.com');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.error-banner');
    console.log('  ✅ Bloqueado exitosamente: El sistema no permitió el reseteo con correo no coincidente');

    // 6.2 Solicitud legítima con DNI y correo registrado
    console.log('  -> Solicitud legítima con correo correcto...');
    await page.fill('#correo', newEmail);
    await page.click('button[type="submit"]');

    // Paso 2: Pantalla de Código OTP y Nueva Contraseña
    await page.waitForSelector('#codigoOtp');
    await page.screenshot({ path: path.join(screenshotsDir, '07_forgot_password_step2.png') });
    console.log('📸 Captura guardada: 07_forgot_password_step2.png');

    await page.fill('#newPassword', 'NuevaClave2026');
    await page.fill('#confirmPassword', 'NuevaClave2026');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.success-banner');
    await page.screenshot({ path: path.join(screenshotsDir, '08_password_reset_success.png') });
    console.log('📸 Captura guardada: 08_password_reset_success.png');

    // Esperar redirección al Login y probar ingreso con la nueva contraseña
    await page.waitForSelector('text=Iniciar Sesión', { timeout: 5000 });
    await page.fill('#codigoDni', newDni);
    await page.fill('#password', 'NuevaClave2026');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.dashboard-layout');
    await page.screenshot({ path: path.join(screenshotsDir, '09_dashboard_post_unblock.png') });
    console.log('📸 Captura guardada: 09_dashboard_post_unblock.png');
    console.log('👀 Manteniendo ventana abierta unos segundos para tu visualización...');
    await page.waitForTimeout(3000);

    console.log('\n🎉 ¡TODAS LAS PRUEBAS E2E Y VERIFICACIÓN VISUAL PASARON CON ÉXITO! 🎉\n');
  } catch (error) {
    console.error('❌ Error durante pruebas E2E:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (frontendProc) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', frontendProc.pid, '/f', '/t']);
      } else {
        frontendProc.kill();
      }
    }
    if (backendProc) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backendProc.pid, '/f', '/t']);
      } else {
        backendProc.kill();
      }
    }
  }
}

runE2E();
