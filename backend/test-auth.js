import app from './src/app.js';
import { initDB } from './src/config/db.js';

let server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

async function runTests() {
  console.log('--- INICIANDO SUITE DE PRUEBAS DE AUTENTICACIÓN Y RECUPERACIÓN OTP (HU-U01) ---');
  
  await initDB();
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
  console.log(`[TEST SERVER] Escuchando en puerto ${PORT}`);

  let passed = 0;
  let failed = 0;

  async function assert(desc, condition) {
    if (condition) {
      console.log(`  ✅ PASÓ: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FALLÓ: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthData = await healthRes.json();
    await assert('Health check responde 200 y status OK', healthRes.status === 200 && healthData.status === 'OK');

    // 2. Registro de nuevo usuario
    const testCode = '2026' + Math.floor(1000 + Math.random() * 9000);
    const testEmail = `seguridad_${testCode}@unmsm.edu.pe`;
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: testCode,
        nombre: 'Usuario Con Protección OTP',
        correo: testEmail,
        password: 'PasswordOriginal123',
        rol: 'alumno'
      })
    });
    const regData = await regRes.json();
    await assert('Registro responde 201 Created', regRes.status === 201 && regData.success === true);

    // 3. Intento de registro duplicado
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: testCode,
        nombre: 'Duplicado',
        correo: testEmail,
        password: 'PasswordOriginal123',
        rol: 'alumno'
      })
    });
    await assert('Registro duplicado rechazado con 409 Conflict', dupRes.status === 409);

    // 4. Login exitoso
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: testCode,
        password: 'PasswordOriginal123'
      })
    });
    const loginData = await loginRes.json();
    await assert('Login exitoso con 200 y token emitido', loginRes.status === 200 && !!loginData.token);
    const userToken = loginData.token;

    // 5. Ruta protegida /me
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const meData = await meRes.json();
    await assert('Ruta protegida /me valida token JWT', meRes.status === 200 && meData.usuario.codigo_dni === testCode);

    // 6. Intentos fallidos y bloqueo (3 intentos erróneos)
    for (let i = 1; i <= 3; i++) {
      await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_dni: testCode, password: 'WrongPassword' })
      });
    }
    const blockedCheck = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, password: 'PasswordOriginal123' })
    });
    await assert('Cuenta bloqueada tras 3 fallos (rechazo con 403 Forbidden)', blockedCheck.status === 403);

    // 7. SEGURIDAD: Atacante intenta resetear clave solo sabiendo el DNI pero con correo falso
    const attackRes = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, correo: 'atacante@gmail.com' })
    });
    const attackData = await attackRes.json();
    await assert(
      'Intento de reseteo con correo no coincidente es RECHAZADO con HTTP 400',
      attackRes.status === 400 && attackData.message.includes('no coincide')
    );

    // 8. Solicitud legítima con Código y Correo exacto
    const legitForgot = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, correo: testEmail })
    });
    const legitData = await legitForgot.json();
    await assert('Solicitud legítima genera código OTP de 6 dígitos', legitForgot.status === 200 && /^\d{6}$/.test(legitData.codigoOtp));
    const otpCode = legitData.codigoOtp;

    // 9. Intento con código OTP erróneo
    const wrongOtpRes = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, codigoOtp: '000000', newPassword: 'NewPasswordSecure456' })
    });
    await assert('Intento con OTP incorrecto es rechazado con 400 Bad Request', wrongOtpRes.status === 400);

    // 10. Restablecimiento exitoso con OTP correcto
    const resetSuccessRes = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, codigoOtp: otpCode, newPassword: 'NewPasswordSecure456' })
    });
    const resetSuccessData = await resetSuccessRes.json();
    await assert('Restablecimiento con OTP correcto desbloquea la cuenta', resetSuccessRes.status === 200 && resetSuccessData.success === true);

    // 11. Login con nueva contraseña tras desbloqueo
    const finalLogin = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_dni: testCode, password: 'NewPasswordSecure456' })
    });
    await assert('Login exitoso con nueva contraseña tras desbloqueo OTP', finalLogin.status === 200);

  } catch (error) {
    console.error('Error durante la ejecución del test:', error);
    failed++;
  } finally {
    if (server) server.close();
    console.log(`\n--- RESULTADOS: ${passed} pasadas, ${failed} fallidas ---`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
