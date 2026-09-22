import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [codigoDni, setCodigoDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación según la restricción CHECK de PostgreSQL (6 a 20 caracteres)
    const regexFormato = /^[A-Za-z0-9]{6,20}$/;
    if (!regexFormato.test(codigoDni)) {
      setError('El Código universitario o DNI debe tener entre 6 y 20 caracteres.');
      return;
    }

    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      // Reemplazar luego con la URL del endpoint real de Express/Spring
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_dni: codigoDni, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Código/DNI o contraseña incorrectos.');
      }

      // Reconocimiento de rol (alumno o docente)
      if (onLoginSuccess) {
        onLoginSuccess(data.usuario);
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
          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="codigoDni">Código Universitario o DNI</label>
            <input
              id="codigoDni"
              type="text"
              placeholder="Ej. 20200123 o 72345678"
              value={codigoDni}
              onChange={(e) => setCodigoDni(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Validando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Aún no tienes cuenta? <a href="#registro">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  );
}