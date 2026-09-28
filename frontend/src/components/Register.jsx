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
    codigoTrabajador: '', // Nuevo campo para HU-U02
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

    const { codigoDni, nombre, correo, rol, password, confirmPassword, codigoTrabajador } = formData;

    if (!codigoDni.trim() || !nombre.trim() || !correo.trim() || !password) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Criterio 1 (HU-U02): Validación del requisito adicional si es administrativo
    if (rol === 'administrativo' && !codigoTrabajador.trim()) {
      setError('El Código de Trabajador o documento es obligatorio para el personal administrativo.');
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
      // Preparamos el payload y solo enviamos el codigo_trabajador si aplica
      const payload = {
        codigo_dni: codigoDni.trim(),
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        rol,
        password,
      };

      if (rol === 'administrativo') {
        payload.codigo_trabajador = codigoTrabajador.trim();
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario.');
      }

      // Criterio 2 (HU-U02): Mensaje de estado pendiente para administrativos
      if (rol === 'administrativo') {
        setSuccessMsg('¡Registro completado! Tu cuenta está en estado PENDIENTE. Un administrador validará tu cargo.');
      } else {
        setSuccessMsg('¡Registro completado con éxito! Redirigiendo al inicio de sesión...');
      }

      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(data.usuario);
        } else if (onNavigate) {
          onNavigate('login');
        }
      }, 2500); // Aumentado ligeramente para que lean el mensaje de pendiente
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
          {successMsg && (
            <div className="success-banner" style={{ backgroundColor: formData.rol === 'administrativo' ? '#fef3c7' : '#dcfce7', color: formData.rol === 'administrativo' ? '#92400e' : '#166534' }}>
              {successMsg}
            </div>
          )}

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

          {/* Campo renderizado condicionalmente para el personal administrativo (HU-U02) */}
          {formData.rol === 'administrativo' && (
            <div className="form-group" style={{ marginBottom: '0.85rem', backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
              <label htmlFor="codigoTrabajador">Código de Trabajador / Documento *</label>
              <input
                id="codigoTrabajador"
                name="codigoTrabajador"
                type="text"
                placeholder="Requisito para validación de cargo"
                value={formData.codigoTrabajador}
                onChange={handleChange}
                disabled={loading}
                style={{ marginTop: '0.3rem' }}
              />
            </div>
          )}

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