import { query } from '../config/db.js';
import { getConvexClient, isConvexActive } from '../config/convexClient.js';

function mapConvexUser(u) {
  if (!u) return null;
  return {
    id: u._id,
    codigo_dni: u.codigoDni,
    nombre: u.nombre,
    correo: u.correo,
    password_hash: u.passwordHash,
    rol: u.rol,
    fecha_registro: u.fechaRegistro,
    intentos_fallidos: u.intentosFallidos || 0,
    bloqueado: !!u.bloqueado,
    token_recuperacion: u.tokenRecuperacion,
    token_expiracion: u.tokenExpiracion
  };
}

export const UserModel = {
  async findByCodigoDni(codigoDni) {
    if (isConvexActive()) {
      const client = getConvexClient();
      const user = await client.query('users:getByCodigoDni', { codigoDni: codigoDni.trim() });
      return mapConvexUser(user);
    }

    const res = await query(
      'SELECT * FROM usuarios WHERE codigo_dni = $1 LIMIT 1',
      [codigoDni]
    );
    return res.rows[0] || null;
  },

  async findByCorreo(correo) {
    if (isConvexActive()) {
      const client = getConvexClient();
      const user = await client.query('users:getByEmail', { correo: correo.trim().toLowerCase() });
      return mapConvexUser(user);
    }

    const res = await query(
      'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1) LIMIT 1',
      [correo.trim()]
    );
    return res.rows[0] || null;
  },

  async findById(id) {
    if (isConvexActive()) {
      const client = getConvexClient();
      const user = await client.query('users:getById', { id });
      return mapConvexUser(user);
    }

    const res = await query(
      'SELECT id, codigo_dni, nombre, correo, rol, fecha_registro, intentos_fallidos, bloqueado FROM usuarios WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  },

  async create({ codigo_dni, nombre, correo, password_hash, rol }) {
    if (isConvexActive()) {
      const client = getConvexClient();
      const result = await client.mutation('users:register', {
        codigoDni: codigo_dni.trim(),
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        passwordHash: password_hash,
        rol
      });
      return {
        id: result.userId,
        codigo_dni: codigo_dni.trim(),
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        rol,
        fecha_registro: Date.now(),
        bloqueado: false
      };
    }

    const res = await query(
      `INSERT INTO usuarios (codigo_dni, nombre, correo, password_hash, rol, intentos_fallidos, bloqueado)
       VALUES ($1, $2, $3, $4, $5, 0, 0)
       RETURNING id, codigo_dni, nombre, correo, rol, fecha_registro, bloqueado`,
      [codigo_dni, nombre.trim(), correo.trim().toLowerCase(), password_hash, rol]
    );
    return res.rows[0];
  },

  async updateIntentosFallidos(id, intentos, bloqueado) {
    if (isConvexActive()) {
      const client = getConvexClient();
      await client.mutation('users:updateIntentos', {
        id,
        intentos,
        bloqueado: !!bloqueado
      });
      return;
    }

    await query(
      'UPDATE usuarios SET intentos_fallidos = $1, bloqueado = $2 WHERE id = $3',
      [intentos, bloqueado ? 1 : 0, id]
    );
  },

  async resetIntentos(id) {
    if (isConvexActive()) {
      const client = getConvexClient();
      await client.mutation('users:resetIntentos', { id });
      return;
    }

    await query(
      'UPDATE usuarios SET intentos_fallidos = 0, bloqueado = 0 WHERE id = $1',
      [id]
    );
  },

  async setResetToken(id, token, expiracion) {
    if (isConvexActive()) {
      const client = getConvexClient();
      await client.mutation('users:setResetToken', {
        id,
        token,
        expiracion
      });
      return;
    }

    await query(
      'UPDATE usuarios SET token_recuperacion = $1, token_expiracion = $2 WHERE id = $3',
      [token, expiracion, id]
    );
  },

  async updatePassword(id, passwordHash) {
    if (isConvexActive()) {
      const client = getConvexClient();
      await client.mutation('users:updatePassword', {
        id,
        passwordHash
      });
      return;
    }

    await query(
      `UPDATE usuarios 
       SET password_hash = $1, token_recuperacion = NULL, token_expiracion = NULL, intentos_fallidos = 0, bloqueado = 0 
       WHERE id = $2`,
      [passwordHash, id]
    );
  }
};
