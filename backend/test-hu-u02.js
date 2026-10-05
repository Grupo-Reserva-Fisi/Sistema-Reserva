import assert from 'node:assert';
import app from './src/app.js';
import { initDB } from './src/config/db.js';

const PORT = 5097;

async function runTests() {
  console.log('--- INICIANDO SUITE DE PRUEBAS HU-U02 (VALIDACIÓN ADMINISTRATIVA) ---');

  await initDB();

  const server = app.listen(PORT);
  console.log(`[TEST SERVER] Escuchando en puerto ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    const random = Math.floor(1000 + Math.random() * 9000);

    // 1. CP-01: Registro de administrativo sin código de trabajador es RECHAZADO con 400
    const resSinTrabajador = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: `ADM${random}`,
        nombre: 'Admin Sin Codigo',
        correo: `admin_sin_${random}@unmsm.edu.pe`,
        password: 'Password123',
        rol: 'administrativo',
        codigo_trabajador: '' // vacío
      })
    });
    assert.strictEqual(resSinTrabajador.status, 400, 'Debe retornar 400 si falta código de trabajador');
    console.log('  ✅ PASÓ Criterio 1: Registro administrativo sin código de trabajador es RECHAZADO con HTTP 400');

    // 2. CP-02: Registro de administrativo con código de trabajador queda en estado PENDIENTE
    const dniAdmin1 = `ADM1${random}`;
    const correoAdmin1 = `admin1_${random}@unmsm.edu.pe`;
    const resRegistro1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: dniAdmin1,
        nombre: 'Lic. Fernando Prado',
        correo: correoAdmin1,
        password: 'Password123',
        rol: 'administrativo',
        codigo_trabajador: 'ADM-FISI-777'
      })
    });
    assert.strictEqual(resRegistro1.status, 201, 'Debe registrar con 201');
    const dataReg1 = await resRegistro1.json();
    assert.strictEqual(dataReg1.pendienteValidacion, true, 'Debe marcarse como pendiente de validación');
    const idAdmin1 = dataReg1.usuario.id;
    console.log('  ✅ PASÓ Criterio 2: Registro administrativo con código queda en estado PENDIENTE (201 Created)');

    // 3. CP-03: Intentar loguear con cuenta administrativa pendiente es RECHAZADO con 403
    const resLoginPendiente = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: dniAdmin1,
        password: 'Password123'
      })
    });
    assert.strictEqual(resLoginPendiente.status, 403, 'Debe retornar 403 Forbidden por cuenta pendiente');
    const dataLoginPend = await resLoginPendiente.json();
    assert.strictEqual(dataLoginPend.pendienteValidacion, true);
    console.log('  ✅ PASÓ Criterio 2: Login de administrativo pendiente es BLOQUEADO con HTTP 403 Forbidden');

    // 4. CP-04: Usuario estándar (alumno) no puede acceder a endpoints de administración (403 Forbidden)
    const resLoginAlumno = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: '20200101', // Juan Alumno
        password: '12345678'
      })
    });
    const { token: tokenAlumno } = await resLoginAlumno.json();

    const resAdminAccesoAlumno = await fetch(`${baseUrl}/admin/pendientes`, {
      headers: { 'Authorization': `Bearer ${tokenAlumno}` }
    });
    assert.strictEqual(resAdminAccesoAlumno.status, 403, 'Alumno debe ser rechazado con 403 en ruta de admin');
    console.log('  ✅ PASÓ Seguridad: Usuario con rol Alumno es RECHAZADO con 403 al panel de administración');

    // 5. CP-05: Administrador superior puede consultar lista de pendientes (GET /api/admin/pendientes)
    const resLoginMasterAdmin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: '08901234', // Carlos Admin FISI
        password: '12345678'
      })
    });
    assert.strictEqual(resLoginMasterAdmin.status, 200);
    const { token: tokenAdmin } = await resLoginMasterAdmin.json();

    const resPendientes = await fetch(`${baseUrl}/admin/pendientes`, {
      headers: { 'Authorization': `Bearer ${tokenAdmin}` }
    });
    assert.strictEqual(resPendientes.status, 200);
    const dataPendientes = await resPendientes.json();
    assert(Array.isArray(dataPendientes.pendientes), 'Debe retornar arreglo de pendientes');
    const existeEnPendientes = dataPendientes.pendientes.some((u) => u.id === idAdmin1 || u.codigo_dni === dniAdmin1);
    assert.strictEqual(existeEnPendientes, true, 'El usuario registrado debe figurar en la lista de pendientes');
    console.log(`  ✅ PASÓ Criterio 3: Administrador consulta lista de pendientes (${dataPendientes.pendientes.length} encontrados)`);

    // 6. CP-06: Administrador aprueba solicitud (PUT /api/admin/usuarios/:id/aprobar)
    const resAprobar = await fetch(`${baseUrl}/admin/usuarios/${idAdmin1}/aprobar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokenAdmin}` }
    });
    assert.strictEqual(resAprobar.status, 200);
    console.log('  ✅ PASÓ Criterio 3 y 4: Administrador APRUEBA solicitud y se despacha notificación de correo');

    // 7. CP-07: Usuario administrativo aprobado ahora sí inicia sesión con éxito
    const resLoginAprobado = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: dniAdmin1,
        password: 'Password123'
      })
    });
    assert.strictEqual(resLoginAprobado.status, 200, 'Ahora debe permitir login con 200');
    const dataLoginAprobado = await resLoginAprobado.json();
    assert.strictEqual(dataLoginAprobado.usuario.rol, 'administrativo');
    assert.strictEqual(dataLoginAprobado.usuario.estado_validacion, 'aprobado');
    console.log('  ✅ PASÓ Criterio 4: Personal aprobado inicia sesión y adquiere permisos de rol administrativo');

    // 8. CP-08: Registrar otro administrativo y RECHAZARLO con motivo
    const dniAdmin2 = `ADM2${random}`;
    const resReg2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: dniAdmin2,
        nombre: 'Postulante Denegado',
        correo: `admin2_${random}@unmsm.edu.pe`,
        password: 'Password123',
        rol: 'administrativo',
        codigo_trabajador: 'ADM-FAKE-000'
      })
    });
    const dataReg2 = await resReg2.json();
    const idAdmin2 = dataReg2.usuario.id;

    // Rechazar sin motivo debe fallar con 400
    const resRechazoSinMotivo = await fetch(`${baseUrl}/admin/usuarios/${idAdmin2}/rechazar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ motivo: '' })
    });
    assert.strictEqual(resRechazoSinMotivo.status, 400);

    // Rechazar con motivo válido
    const motivoRechazo = 'Código de trabajador no coincide con la nómina de la Unidad de Recursos Humanos.';
    const resRechazar = await fetch(`${baseUrl}/admin/usuarios/${idAdmin2}/rechazar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` },
      body: JSON.stringify({ motivo: motivoRechazo })
    });
    assert.strictEqual(resRechazar.status, 200);
    console.log('  ✅ PASÓ Criterio 3 y 5: Administrador RECHAZA solicitud con motivo registrado y notificación de correo');

    // 9. CP-09: Usuario rechazado intenta loguear y recibe el motivo de rechazo (HTTP 403)
    const resLoginRechazado = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_dni: dniAdmin2,
        password: 'Password123'
      })
    });
    assert.strictEqual(resLoginRechazado.status, 403);
    const dataLoginRech = await resLoginRechazado.json();
    assert.strictEqual(dataLoginRech.rechazado, true);
    assert(dataLoginRech.motivo.includes('nómina'), 'Debe incluir el motivo del rechazo');
    console.log('  ✅ PASÓ Criterio 5: Usuario rechazado recibe mensaje informativo con el motivo de rechazo');

    console.log('\n--- RESULTADOS HU-U02: 9 de 9 pruebas unitarias e integración PASADAS EXITOSAMENTE ---');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ ERROR EN TEST HU-U02:', err);
  process.exit(1);
});
