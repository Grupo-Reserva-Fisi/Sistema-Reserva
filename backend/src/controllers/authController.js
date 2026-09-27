import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fisi_unmsm_jwt_super_secret_key_2026';
const VALID_ROLES = ['alumno', 'docente', 'administrativo', 'foraneo', 'externo'];

// Función para enmascarar correos (ej: juan.alumno@unmsm.edu.pe -> j***o@unmsm.edu.pe)
function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export const AuthController = {
  // REGISTRO (HU-U01)
  async register(req, res) {
    try {
      const { codigo_dni, nombre, correo, password, rol = 'alumno' } = req.body;

      if (!codigo_dni || !nombre || !correo || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
      }

      const cleanCodigo = codigo_dni.trim();
      const cleanNombre = nombre.trim();
      const cleanCorreo = correo.trim().toLowerCase();

      // Validación de formato alfanumérico 6-20
      const regexCodigo = /^[A-Za-z0-9]{6,20}$/;
      if (!regexCodigo.test(cleanCodigo)) {
        return res.status(400).json({
          message: 'El código universitario o DNI debe ser alfanumérico y tener entre 6 y 20 caracteres.'
        });
      }

      // Validación de correo
      const regexCorreo = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!regexCorreo.test(cleanCorreo)) {
        return res.status(400).json({ message: 'Formato de correo electrónico inválido.' });
      }

      // Validación de contraseña
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      }

      // Validación de rol
      if (!VALID_ROLES.includes(rol)) {
        return res.status(400).json({
          message: `El rol '${rol}' no es válido. Roles permitidos: ${VALID_ROLES.join(', ')}.`
        });
      }

      // Validar duplicados
      const existeCodigo = await UserModel.findByCodigoDni(cleanCodigo);
      if (existeCodigo) {
        return res.status(409).json({ message: 'El código o DNI ya se encuentra registrado.' });
      }

      const existeCorreo = await UserModel.findByCorreo(cleanCorreo);
      if (existeCorreo) {
        return res.status(409).json({ message: 'Ya existe un usuario registrado con este correo.' });
      }

      // Hashing seguro de contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const nuevoUsuario = await UserModel.create({
        codigo_dni: cleanCodigo,
        nombre: cleanNombre,
        correo: cleanCorreo,
        password_hash: passwordHash,
        rol
      });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        usuario: {
          id: nuevoUsuario.id,
          codigo_dni: nuevoUsuario.codigo_dni,
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol
        }
      });
    } catch (error) {
      console.error('[Error en register]:', error);
      return res.status(500).json({ message: 'Error interno del servidor al procesar el registro.' });
    }
  },

  // INICIO DE SESIÓN (HU-U01)
  async login(req, res) {
    try {
      const { codigo_dni, password } = req.body;

      if (!codigo_dni || !password) {
        return res.status(400).json({ message: 'Debe ingresar su código/DNI o correo y su contraseña.' });
      }

      const identificador = codigo_dni.trim();

      // Buscar por código/DNI o por correo
      let usuario = await UserModel.findByCodigoDni(identificador);
      if (!usuario) {
        usuario = await UserModel.findByCorreo(identificador);
      }

      if (!usuario) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }

      // Validar si la cuenta está bloqueada por 3 intentos
      if (usuario.bloqueado) {
        return res.status(403).json({
          message: 'Cuenta bloqueada por superar los 3 intentos fallidos. Utilice la opción de recuperación de contraseña.',
          bloqueado: true
        });
      }

      // Validar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordValida) {
        const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
        const seBloquea = nuevosIntentos >= 3;

        await UserModel.updateIntentosFallidos(usuario.id, nuevosIntentos, seBloquea);

        if (seBloquea) {
          return res.status(403).json({
            message: 'Cuenta bloqueada por superar los 3 intentos fallidos. Utilice la opción de recuperación de contraseña.',
            bloqueado: true,
            intentosFallidos: nuevosIntentos
          });
        }

        return res.status(401).json({
          message: `Credenciales incorrectas. Intento ${nuevosIntentos} de 3.`,
          intentosFallidos: nuevosIntentos,
          intentosRestantes: 3 - nuevosIntentos
        });
      }

      // Credenciales válidas: reiniciar contador de intentos
      await UserModel.resetIntentos(usuario.id);

      // Generar token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          codigo_dni: usuario.codigo_dni,
          correo: usuario.correo,
          rol: usuario.rol
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        token,
        usuario: {
          id: usuario.id,
          codigo_dni: usuario.codigo_dni,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('[Error en login]:', error);
      return res.status(500).json({ message: 'Error interno del servidor al procesar el inicio de sesión.' });
    }
  },

  // SOLICITUD DE RECUPERACIÓN CON DOBLE FACTOR (Código/DNI + Correo Asociado)
  async forgotPassword(req, res) {
    try {
      const { codigo_dni, correo } = req.body;

      if (!codigo_dni || !correo) {
        return res.status(400).json({
          message: 'Por seguridad, debes ingresar tanto tu Código/DNI como tu Correo Electrónico registrado.'
        });
      }

      const cleanCodigo = codigo_dni.trim();
      const cleanCorreo = correo.trim().toLowerCase();

      // 1. Buscar usuario por Código/DNI
      const usuario = await UserModel.findByCodigoDni(cleanCodigo);
      if (!usuario) {
        return res.status(404).json({
          message: 'No se encontró ningún usuario con el Código o DNI ingresado.'
        });
      }

      // 2. Validación estricta de seguridad: El correo DEBE coincidir con el del usuario
      if (usuario.correo.toLowerCase() !== cleanCorreo) {
        return res.status(400).json({
          message: 'El correo electrónico no coincide con el código registrado. Por seguridad no es posible continuar.'
        });
      }

      // 3. Generar código OTP numérico de 6 dígitos
      const codigoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiracion = Date.now() + 15 * 60 * 1000; // 15 minutos

      await UserModel.setResetToken(usuario.id, codigoOtp, expiracion);

      // 4. Despachar correo electrónico mediante Nodemailer / Ethereal
      const emailResult = await sendOtpEmail({
        destinatario: usuario.correo,
        nombre: usuario.nombre,
        codigoOtp
      });

      return res.status(200).json({
        success: true,
        message: `Código de verificación de 6 dígitos enviado a ${maskEmail(usuario.correo)}.`,
        correoEnmascarado: maskEmail(usuario.correo),
        codigo_dni: usuario.codigo_dni,
        previewUrl: emailResult.previewUrl,
        codigoOtp: emailResult.codigoOtp // Útil para entornos de prueba
      });
    } catch (error) {
      console.error('[Error en forgotPassword]:', error);
      return res.status(500).json({ message: 'Error al procesar la solicitud de recuperación.' });
    }
  },

  // RESTABLECIMIENTO DE CONTRASEÑA CON CÓDIGO OTP (HU-U01)
  async resetPassword(req, res) {
    try {
      const { codigo_dni, codigoOtp, newPassword } = req.body;

      if (!codigo_dni || !codigoOtp || !newPassword) {
        return res.status(400).json({
          message: 'El Código/DNI, el código de verificación OTP y la nueva contraseña son obligatorios.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const usuario = await UserModel.findByCodigoDni(codigo_dni.trim());
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      // Validar código OTP
      if (!usuario.token_recuperacion || usuario.token_recuperacion.trim() !== codigoOtp.trim()) {
        return res.status(400).json({ message: 'Código de verificación incorrecto.' });
      }

      // Validar expiración (15 minutos)
      if (usuario.token_expiracion && Date.now() > Number(usuario.token_expiracion)) {
        return res.status(400).json({ message: 'El código de verificación ha expirado (límite de 15 minutos). Solicita uno nuevo.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Actualizar contraseña y desbloquear automáticamente
      await UserModel.updatePassword(usuario.id, passwordHash);

      return res.status(200).json({
        success: true,
        message: '¡Contraseña restablecida exitosamente! Tu cuenta ha sido desbloqueada.'
      });
    } catch (error) {
      console.error('[Error en resetPassword]:', error);
      return res.status(500).json({ message: 'Error al restablecer la contraseña.' });
    }
  },

  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  async getProfile(req, res) {
    try {
      const usuario = await UserModel.findById(req.user.id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
      return res.status(200).json({ usuario });
    } catch (error) {
      console.error('[Error en getProfile]:', error);
      return res.status(500).json({ message: 'Error al obtener el perfil.' });
    }
  }
};
