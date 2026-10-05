import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgresConfigured = !!(process.env.DATABASE_URL || process.env.DB_HOST);

let pool = null;
let sqliteDb = null;
let dbType = 'sqlite';

if (isPostgresConfigured) {
  try {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    dbType = 'postgres';
    console.log('[DB] Configurado modo PostgreSQL.');
  } catch (err) {
    console.warn('[DB] No se pudo inicializar PostgreSQL, usando SQLite como contingencia:', err.message);
    pool = null;
    dbType = 'sqlite';
  }
}

if (dbType === 'sqlite') {
  const { DatabaseSync } = await import('node:sqlite');
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  console.log(`[DB] Base de datos SQLite activa en: ${dbPath}`);
}

export async function query(text, params = []) {
  if (dbType === 'postgres' && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (pgError) {
      console.error('[DB Postgres Error]:', pgError.message);
      throw pgError;
    }
  }

  // SQLite adapter
  try {
    const sqliteSql = text.replace(/\$(\d+)/g, '?');
    const isSelectOrReturning = /^\s*(SELECT|WITH)/i.test(sqliteSql) || /RETURNING/i.test(sqliteSql);

    const stmt = sqliteDb.prepare(sqliteSql);
    if (isSelectOrReturning) {
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const result = stmt.run(...params);
      return { rows: [], rowCount: result.changes, lastInsertRowid: result.lastInsertRowid };
    }
  } catch (sqliteError) {
    console.error('[DB SQLite Error]:', sqliteError.message);
    throw sqliteError;
  }
}

export async function initDB() {
  if (dbType === 'postgres' && pool) {
    try {
      const schemaSqlPath = path.resolve(__dirname, '../../database/schema.sql');
      if (fs.existsSync(schemaSqlPath)) {
        const ddl = fs.readFileSync(schemaSqlPath, 'utf-8');
        await pool.query(ddl);
        console.log('[DB Postgres] Esquema verificado / inicializado.');
      }
    } catch (err) {
      console.warn('[DB Postgres] Error verificando esquema Postgres:', err.message);
    }
    return;
  }

  // Inicialización SQLite
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_dni TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('alumno', 'docente', 'administrativo', 'foraneo', 'externo')),
      codigo_trabajador TEXT,
      estado_validacion TEXT NOT NULL DEFAULT 'aprobado' CHECK(estado_validacion IN ('aprobado', 'pendiente', 'rechazado')),
      motivo_rechazo TEXT,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      intentos_fallidos INTEGER NOT NULL DEFAULT 0,
      bloqueado INTEGER NOT NULL DEFAULT 0,
      token_recuperacion TEXT,
      token_expiracion INTEGER
    );
  `);

  // Migración dinámica para bases SQLite existentes (HU-U02)
  try {
    const tableInfo = sqliteDb.prepare("PRAGMA table_info(usuarios)").all();
    const columnNames = tableInfo.map(c => c.name);
    if (!columnNames.includes('codigo_trabajador')) {
      sqliteDb.exec("ALTER TABLE usuarios ADD COLUMN codigo_trabajador TEXT;");
    }
    if (!columnNames.includes('estado_validacion')) {
      sqliteDb.exec("ALTER TABLE usuarios ADD COLUMN estado_validacion TEXT NOT NULL DEFAULT 'aprobado';");
    }
    if (!columnNames.includes('motivo_rechazo')) {
      sqliteDb.exec("ALTER TABLE usuarios ADD COLUMN motivo_rechazo TEXT;");
    }
  } catch (err) {
    console.warn('[DB SQLite Migration Warning]:', err.message);
  }

  // Verificar si hay registros
  const countStmt = sqliteDb.prepare('SELECT COUNT(*) as total FROM usuarios');
  const countRes = countStmt.all();
  if (countRes[0].total === 0) {
    console.log('[DB SQLite] Insertando usuarios iniciales (seeds)...');
    const seedHash = '$2a$10$pMPlgAQZVXUK/.NmylOQJO.eqbMKdzXNX1NpB.s/GdUnNoeILIkSC'; // '12345678'
    const insertStmt = sqliteDb.prepare(`
      INSERT INTO usuarios (codigo_dni, nombre, correo, password_hash, rol, codigo_trabajador, estado_validacion, intentos_fallidos, bloqueado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    insertStmt.run('20200101', 'Juan Alumno Pérez', 'juan.alumno@unmsm.edu.pe', seedHash, 'alumno', null, 'aprobado');
    insertStmt.run('10102020', 'Dra. María Docente López', 'maria.docente@unmsm.edu.pe', seedHash, 'docente', null, 'aprobado');
    insertStmt.run('08901234', 'Carlos Admin FISI', 'carlos.admin@unmsm.edu.pe', seedHash, 'administrativo', 'ADM-FISI-001', 'aprobado');
    insertStmt.run('07890123', 'Lic. Roberto Pendiente', 'roberto.admin@unmsm.edu.pe', seedHash, 'administrativo', 'ADM-FISI-088', 'pendiente');
    insertStmt.run('71234567', 'Pedro Foráneo García', 'pedro.foraneo@gmail.com', seedHash, 'foraneo', null, 'aprobado');
    insertStmt.run('79876543', 'Ana Externa Quispe', 'ana.externa@gmail.com', seedHash, 'externo', null, 'aprobado');
    console.log('[DB SQLite] Seeds insertados correctamente.');
  }
}

export default { query, initDB };
