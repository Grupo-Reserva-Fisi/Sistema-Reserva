import nodemailer from 'nodemailer';

let etherealTransporter = null;

async function getTransporter() {
  // 1. Si hay credenciales configuradas en .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }),
      isEthereal: false
    };
  }

  // 2. Si no, usamos cuenta de prueba Ethereal para desarrollo seguro
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Cuenta de prueba Ethereal inicializada: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email] No se pudo crear cuenta Ethereal, usando fallback de consola:', err.message);
      return { transporter: null, isEthereal: false };
    }
  }

  return { transporter: etherealTransporter, isEthereal: true };
}

export async function sendOtpEmail({ destinatario, nombre, codigoOtp }) {
  console.log(`\n======================================================`);
  console.log(`📧 [SISTEMA DE RECUPERACIÓN FISI - UNMSM]`);
  console.log(`   Destinatario: ${nombre} <${destinatario}>`);
  console.log(`   CÓDIGO DE VERIFICACIÓN (OTP): [ ${codigoOtp} ]`);
  console.log(`   Vigencia: 15 minutos`);
  console.log(`======================================================\n`);

  try {
    const { transporter, isEthereal } = await getTransporter();

    if (!transporter) {
      return { success: true, previewUrl: null, codigoOtp };
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #0e2b5c; padding: 24px; text-align: center; border-bottom: 4px solid #b91c1c;">
          <span style="background-color: #b91c1c; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
            FISI • UNMSM
          </span>
          <h2 style="color: #ffffff; margin: 12px 0 0 0; font-size: 20px;">Sistema de Reservas y Préstamos</h2>
        </div>
        <div style="padding: 32px 28px;">
          <h3 style="color: #0f172a; margin-top: 0;">Restablecimiento de Contraseña</h3>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">
            Hola <strong>${nombre}</strong>, has solicitado recuperar el acceso a tu cuenta.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">
            Ingresa el siguiente código de seguridad en la aplicación para verificar tu identidad y desbloquear tu cuenta:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #0e2b5c; color: #0e2b5c; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; padding: 14px 28px; border-radius: 10px;">
              ${codigoOtp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
            ⏱️ Este código es válido únicamente durante los próximos <strong>15 minutos</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Si tú no solicitaste este cambio, puedes ignorar este mensaje; tu cuenta continúa segura y protegida.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sistema de Reservas FISI" <no-reply@fisi.unmsm.edu.pe>',
      to: destinatario,
      subject: `Código de Recuperación: ${codigoOtp} - FISI UNMSM`,
      text: `Hola ${nombre}, tu código de recuperación para el Sistema de Reservas FISI es: ${codigoOtp}. Válido por 15 minutos.`,
      html: htmlContent
    });

    let previewUrl = null;
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 [Preview de Correo Ethereal]: ${previewUrl}`);
    }

    return { success: true, previewUrl, codigoOtp };
  } catch (err) {
    console.warn('[Email Warning]: Error al enviar correo SMTP, fallback a código en consola:', err.message);
    return { success: true, previewUrl: null, codigoOtp };
  }
}
