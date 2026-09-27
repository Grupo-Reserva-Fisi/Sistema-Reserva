import { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigate }) {
  const [codigoDni, setCodigoDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsBlocked(false);

    const cleanInput = codigoDni.trim();
    if (!cleanInput) {
      setError('Por favor, ingresa tu Código universitario, DNI o correo.');
      return;
    }

    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_dni: cleanInput, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.bloqueado) {
          setIsBlocked(true);
        }
        throw new Error(data.message || 'Código/DNI o contraseña incorrectos.');
      }

      // Login exitoso
      if (onLoginSuccess) {
        onLoginSuccess(data.usuario, data.token);
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge">FISI • UNMSM</div>
          <h2>Iniciar Sesión</h2>
          <p>Sistema de Reservas y Préstamos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div
              className="error-banner"
              style={
                isBlocked
                  ? { backgroundColor: '#fee2e2', color: '#991b1b', borderLeftColor: '#b91c1c' }
                  : {}
              }
            >
              <strong>{isBlocked ? '⚠️ Cuenta Bloqueada' : 'Aviso'}:</strong> {error}
              {isBlocked && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate) onNavigate('forgotPassword');
                    }}
                    style={{ color: '#1d4ed8', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    Haz clic aquí para recuperar tu contraseña y desbloquear tu cuenta.
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="codigoDni">Código Universitario, DNI o Correo</label>
            <input
              id="codigoDni"
              type="text"
              placeholder="Ej. 20200123, 72345678 o correo"
              value={codigoDni}
              onChange={(e) => {
                setCodigoDni(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ marginBottom: '0.4rem' }}>Contraseña</label>
              <a
                href="#recuperar"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('forgotPassword');
                }}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-secondary-blue)',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Validando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Aún no tienes cuenta?{' '}
            <a
              href="#registro"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('register');
              }}
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}