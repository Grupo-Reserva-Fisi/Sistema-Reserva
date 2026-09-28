import { useState } from 'react';
import './ValidacionPersonal.css';

export default function ValidacionPersonal() {
  // Datos simulados (Mock) para pruebas de interfaz
  const [pendientes, setPendientes] = useState([
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      codigo_dni: '10203040',
      correo: 'cmendoza@unmsm.edu.pe',
      codigo_trabajador: 'ADM-FISI-088',
      fecha_registro: '2026-09-27'
    },
    {
      id: 2,
      nombre: 'Lucía Torres',
      codigo_dni: '76543210',
      correo: 'ltorres@unmsm.edu.pe',
      codigo_trabajador: 'DOC-FISI-012',
      fecha_registro: '2026-09-27'
    }
  ]);

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Criterio 3 y 4: Aprobar validación y asignar rol
  const handleAprobar = (id, nombre) => {
    // Aquí iría el fetch real: fetch(`/api/usuarios/${id}/aprobar`, { method: 'PUT' })
    setPendientes(pendientes.filter(usuario => usuario.id !== id));
    setMensaje({ texto: `✅ Se aprobó a ${nombre}. Ahora tiene rol administrativo.`, tipo: 'success' });
    limpiarMensaje();
  };

  // Criterio 3 y 5: Rechazar validación pidiendo motivo
  const handleRechazar = (id, nombre) => {
    const motivo = window.prompt(`Indique el motivo de rechazo para ${nombre}:\n(Este mensaje se enviará al usuario)`);
    
    if (motivo !== null && motivo.trim() !== "") {
      // Aquí iría el fetch real: fetch(`/api/usuarios/${id}/rechazar`, { method: 'PUT', body: JSON.stringify({ motivo }) })
      setPendientes(pendientes.filter(usuario => usuario.id !== id));
      setMensaje({ texto: `❌ Se rechazó a ${nombre}. Motivo enviado: "${motivo}"`, tipo: 'error' });
      limpiarMensaje();
    }
  };

  const limpiarMensaje = () => {
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-header">
        <h2>Validación de Personal Administrativo</h2>
        <p>Revisa y aprueba los registros de cuentas con privilegios administrativos.</p>
      </div>

      {mensaje.texto && (
        <div className={`alert-banner ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="table-container">
        {pendientes.length === 0 ? (
          <div className="empty-state">No hay cuentas administrativas pendientes de validación.</div>
        ) : (
          <table className="fisi-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI / Código</th>
                <th>Correo Institucional</th>
                <th>Cód. Trabajador</th>
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
                  <td><span className="badge-trabajador">{usuario.codigo_trabajador}</span></td>
                  <td>{usuario.fecha_registro}</td>
                  <td className="action-buttons">
                    <button 
                      className="btn-approve" 
                      onClick={() => handleAprobar(usuario.id, usuario.nombre)}
                    >
                      Aprobar
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => handleRechazar(usuario.id, usuario.nombre)}
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
    </div>
  );
}