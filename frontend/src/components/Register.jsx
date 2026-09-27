import { useState } from 'react';
import './Login.css';

export default function Register({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    codigoDni: '',
    nombre: '',
    correo: '',
    rol: 'alumno',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const { codigoDni, nombre, correo, rol, password, confirmPassword } = formData;

    if (!codigoDni.trim() || !nombre.trim() || !correo.trim() || !password) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const regexFormato = /^[A-Za-z0-9]{6,20}$/;
    if (!regexFormato.test(codigoDni.trim())) {
      setError('El Código universitario o DNI debe ser alfanumérico y tener entre 6 y 20 caracteres.');
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo.trim())) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_dni: codigoDni.trim(),
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          rol,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario.');
      }

      setSuccessMsg('¡Registro completado con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(data.usuario);
        } else if (onNavigate) {
          onNavigate('login');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: '520px' }}>
        <div className="login-header" style={{ padding: '1.75rem 2rem 1rem' }}>
          <div className="brand-badge">FISI • UNMSM</div>
          <h2>Crear Cuenta</h2>
          <p>Sistema de Reservas y Préstamos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ padding: '0.5rem 2rem 1.75rem' }}>
          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="codigoDni">Código o DNI *</label>
              <input
                id="codigoDni"
                name="codigoDni"
                type="text"
                placeholder="20200123 / 72345678"
                value={formData.codigoDni}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="rol">Rol en FISI *</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="alumno">Alumno (UNMSM)</option>
                <option value="docente">Docente (UNMSM)</option>
                <option value="administrativo">Personal Administrativo</option>
                <option value="foraneo">Foráneo</option>
                <option value="externo">Externo (Público General)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ej. Juan Carlos Pérez"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="correo">Correo Electrónico *</label>
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="ejemplo@unmsm.edu.pe o gmail.com"
              value={formData.correo}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="confirmPassword">Confirmar *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Registrando cuenta...' : 'Registrarse en el Sistema'}
          </button>
        </form>

        <div className="login-footer" style={{ padding: '0.9rem 1.5rem 1.25rem' }}>
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
