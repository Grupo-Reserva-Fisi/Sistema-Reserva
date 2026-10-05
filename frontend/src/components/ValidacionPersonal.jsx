import { useState, useEffect, useCallback } from 'react';
import './ValidacionPersonal.css';

export default function ValidacionPersonal({ token }) {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Estado para el modal de rechazo
  const [modalRechazo, setModalRechazo] = useState({ abierto: false, id: null, nombre: '', motivo: '' });

  const authToken = token || localStorage.getItem('token');

  const cargarPendientes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/pendientes', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar personal pendiente.');
      }
      setPendientes(data.pendientes || []);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const limpiarMensaje = () => {
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  // Criterio 3 y 4 (HU-U02): Aprobar validación y asignar rol administrativo
  const handleAprobar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro/a de aprobar la solicitud administrativa de ${nombre}?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/admin/usuarios/${id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar usuario.');
      }

      setPendientes((prev) => prev.filter((usuario) => usuario.id !== id));
      setMensaje({
        texto: `✅ Se aprobó a ${nombre}. Ahora cuenta con privilegios administrativos activos y se le notificó por correo.`,
        tipo: 'success'
      });
      limpiarMensaje();
    } catch (err) {
      setMensaje({ texto: `Error: ${err.message}`, tipo: 'error' });
      limpiarMensaje();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Abrir modal de rechazo
  const abrirModalRechazo = (id, nombre) => {
    setModalRechazo({ abierto: true, id, nombre, motivo: '' });
  };

  const cerrarModalRechazo = () => {
    setModalRechazo({ abierto: false, id: null, nombre: '', motivo: '' });
  };

  // Criterio 3 y 5 (HU-U02): Rechazar validación con motivo y notificación
  const handleConfirmarRechazo = async (e) => {
    e.preventDefault();
    const { id, nombre, motivo } = modalRechazo;

    if (!motivo.trim()) {
      alert('Por favor ingrese el motivo del rechazo.');
      return;
    }

    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/admin/usuarios/${id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ motivo: motivo.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar usuario.');
      }

      setPendientes((prev) => prev.filter((usuario) => usuario.id !== id));
      setMensaje({
        texto: `❌ Se rechazó la solicitud de ${nombre}. Notificación enviada con el motivo registrado.`,
        tipo: 'error'
      });
      limpiarMensaje();
      cerrarModalRechazo();
    } catch (err) {
      alert(`Error al rechazar: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Reciente';
    try {
      const d = new Date(typeof fecha === 'number' ? fecha : fecha);
      return isNaN(d.getTime()) ? String(fecha).substring(0, 10) : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(fecha);
    }
  };

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Validación de Personal Administrativo (HU-U02)</h2>
          <p>Revisa y aprueba los registros de cuentas con acreditación de cargo institucional.</p>
        </div>
        <button
          onClick={cargarPendientes}
          disabled={loading}
          className="btn-refresh"
          style={{ backgroundColor: '#0e2b5c', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          {loading ? 'Cargando...' : '🔄 Actualizar Lista'}
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}
      {mensaje.texto && <div className={`alert-banner ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="table-container">
        {loading ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⌛</div>
            Cargando solicitudes de personal administrativo pendientes...
          </div>
        ) : pendientes.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
            No hay cuentas administrativas pendientes de validación en este momento.
          </div>
        ) : (
          <table className="fisi-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI / Código</th>
                <th>Correo Institucional</th>
                <th>Cód. Trabajador / Doc.</th>
                <th>Fecha Reg.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="fw-bold">{usuario.nombre}</td>
                  <td>{usuario.codigo_dni}</td>
                  <td>{usuario.correo}</td>
                  <td>
                    <span className="badge-trabajador">
                      {usuario.codigo_trabajador || 'No especificado'}
                    </span>
                  </td>
                  <td>{formatearFecha(usuario.fecha_registro)}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() => handleAprobar(usuario.id, usuario.nombre)}
                      disabled={actionLoadingId === usuario.id}
                    >
                      {actionLoadingId === usuario.id ? 'Aprobando...' : 'Aprobar'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => abrirModalRechazo(usuario.id, usuario.nombre)}
                      disabled={actionLoadingId === usuario.id}
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal accesible para ingresar motivo de rechazo */}
      {modalRechazo.abierto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '1.75rem',
            maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#0e2b5c', marginTop: 0 }}>Rechazar Solicitud Administrativa</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Indica el motivo de rechazo para <strong>{modalRechazo.nombre}</strong>. Este motivo se registrará en el sistema y se le enviará por correo.
            </p>

            <form onSubmit={handleConfirmarRechazo}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#1e293b', fontSize: '0.85rem' }}>
                  Motivo de rechazo *
                </label>
                <textarea
                  rows="3"
                  value={modalRechazo.motivo}
                  onChange={(e) => setModalRechazo({ ...modalRechazo, motivo: e.target.value })}
                  placeholder="Ej: El código de trabajador no figura en la nómina oficial de la FISI o el documento no es legible."
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '0.65rem',
                    border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={cerrarModalRechazo}
                  style={{
                    padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === modalRechazo.id}
                  style={{
                    padding: '0.5rem 1rem', background: '#b91c1c', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  {actionLoadingId === modalRechazo.id ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}