import { useState } from 'react';
import './Login.css';

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: Identificación doble, 2: Validación OTP y Nueva Contraseña
  const [codigoDni, setCodigoDni] = useState('');
  const [correo, setCorreo] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Paso 1: Verificación de Doble Factor (Código/DNI + Correo Asociado)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!codigoDni.trim() || !correo.trim()) {
      setError('Por seguridad, debes ingresar tanto tu Código/DNI como tu correo registrado.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_dni: codigoDni.trim(),
          correo: correo.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo procesar la solicitud.');
      }

      setSuccessMsg(data.message || 'Código de seguridad enviado a tu correo.');
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      }
      // En entorno local/demo, autocompletamos el OTP si viene en respuesta para comodidad de prueba
      if (data.codigoOtp) {
        setCodigoOtp(data.codigoOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Validación del Código OTP y Restablecimiento de Contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!codigoOtp.trim()) {
      setError('Por favor, ingresa el código de 6 dígitos enviado a tu correo.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_dni: codigoDni.trim(),
          codigoOtp: codigoOtp.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la contraseña.');
      }

      setSuccessMsg('¡Contraseña restablecida exitosamente! Tu cuenta ha sido desbloqueada.');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: '460px' }}>
        <div className="login-header">
          <div className="brand-badge">FISI • UNMSM</div>
          <h2>Recuperar Contraseña</h2>
          <p>
            {step === 1
              ? 'Verificación de Seguridad en Dos Pasos'
              : 'Verificación del Código OTP y Nueva Contraseña'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="login-form">
            {error && <div className="error-banner">{error}</div>}

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.4' }}>
              🔒 <strong>Protección contra terceros:</strong> Para verificar que eres el titular de la cuenta,
              ingresa tanto tu Código/DNI como el correo institucional asociado.
            </p>

            <div className="form-group">
              <label htmlFor="codigoDni">Código Universitario o DNI *</label>
              <input
                id="codigoDni"
                type="text"
                placeholder="Ej. 20200101 o 72345678"
                value={codigoDni}
                onChange={(e) => setCodigoDni(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico Asociado *</label>
              <input
                id="correo"
                type="email"
                placeholder="ejemplo@unmsm.edu.pe"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Validando datos...' : 'Enviar Código de Seguridad'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            {error && <div className="error-banner">{error}</div>}
            {successMsg && <div className="success-banner">{successMsg}</div>}

            {emailPreviewUrl && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  color: '#1e40af',
                }}
              >
                📬 <strong>Bandeja de prueba:</strong>{' '}
                <a
                  href={emailPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#1d4ed8', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Abrir correo en Ethereal Email
                </a>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="codigoOtp">Código de Seguridad (6 dígitos) *</label>
              <input
                id="codigoOtp"
                type="text"
                placeholder="Ej. 482910"
                value={codigoOtp}
                onChange={(e) => setCodigoOtp(e.target.value)}
                disabled={loading}
                maxLength={6}
                style={{ letterSpacing: '0.25em', fontWeight: '700', fontSize: '1.1rem', textAlign: 'center' }}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña (mínimo 6 caracteres) *</label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Actualizando contraseña...' : 'Verificar y Desbloquear Cuenta'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              ← Volver al inicio de sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
