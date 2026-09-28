import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ValidacionPersonal from './components/ValidacionPersonal';
import './App.css';

function App() {
  // Ahora manejamos también 'validacionAdmin'
  const [currentView, setCurrentView] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar sesión persistida si existe
  useEffect(() => {
    const savedToken = localStorage.getItem('fisi_auth_token');
    const savedUser = localStorage.getItem('fisi_auth_user');
    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentView('dashboard');
      } catch (e) {
        localStorage.removeItem('fisi_auth_token');
        localStorage.removeItem('fisi_auth_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user, authToken) => {
    setCurrentUser(user);
    localStorage.setItem('fisi_auth_token', authToken);
    localStorage.setItem('fisi_auth_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fisi_auth_token');
    localStorage.removeItem('fisi_auth_user');
    setCurrentView('login');
  };

  // Rol label y badge styling
  const getRoleBadge = (rol) => {
    const badges = {
      alumno: { label: 'Alumno UNMSM', bg: '#dbeafe', color: '#1e40af' },
      docente: { label: 'Docente UNMSM', bg: '#fef3c7', color: '#92400e' },
      administrativo: { label: 'Administrativo FISI', bg: '#f3e8ff', color: '#6b21a8' },
      foraneo: { label: 'Foráneo', bg: '#e0e7ff', color: '#3730a3' },
      externo: { label: 'Externo', bg: '#f1f5f9', color: '#334155' },
    };
    const b = badges[rol] || { label: rol, bg: '#f1f5f9', color: '#334155' };
    return (
      <span
        style={{
          backgroundColor: b.bg,
          color: b.color,
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontWeight: '700',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: 'inline-block',
        }}
      >
        {b.label}
      </span>
    );
  };

  return (
    <>
      {currentView === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'register' && (
        <Register
          onNavigate={(view) => setCurrentView(view)}
          onRegisterSuccess={() => setCurrentView('login')}
        />
      )}

      {currentView === 'forgotPassword' && (
        <ForgotPassword
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {/* Renderizado de la vista de Validación de Personal (Solo para Administrativos) */}
      {currentView === 'validacionAdmin' && currentUser && currentUser.rol === 'administrativo' && (
        <div className="dashboard-layout">
          {/* Header Superior Reutilizado */}
          <header className="dashboard-header">
            <div className="brand-section">
              <div className="brand-crest">FISI • UNMSM</div>
              <h1 className="system-title">Validación de Personal</h1>
            </div>

            <div className="user-nav">
              <div className="user-profile-meta">
                <div className="user-name">{currentUser.nombre}</div>
                <div className="user-email">{currentUser.correo}</div>
              </div>
              {/* Botón para volver al Dashboard principal */}
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className="btn-primary"
                style={{ backgroundColor: '#1d4ed8', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
              >
                Volver al Inicio
              </button>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </header>

          {/* Componente de la HU-U02 */}
          <ValidacionPersonal />
        </div>
      )}

      {currentView === 'dashboard' && currentUser && (
        <div className="dashboard-layout">
          {/* Header Superior */}
          <header className="dashboard-header">
            <div className="brand-section">
              <div className="brand-crest">FISI • UNMSM</div>
              <h1 className="system-title">Sistema de Reservas y Préstamos</h1>
            </div>

            <div className="user-nav">
              <div className="user-profile-meta">
                <div className="user-name">{currentUser.nombre}</div>
                <div className="user-email">{currentUser.correo}</div>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="dashboard-main">
            {/* Banner de Bienvenida */}
            <div className="welcome-card">
              <div className="welcome-info">
                <div>{getRoleBadge(currentUser.rol)}</div>
                <h2>¡Bienvenido/a, {currentUser.nombre}!</h2>
                <p>Has iniciado sesión correctamente en el Sistema Oficial de Reservas de la FISI.</p>
                
                {/* Botón exclusivo para Administradores que lleva a la vista de Validación */}
                {currentUser.rol === 'administrativo' && (
                  <button 
                    onClick={() => setCurrentView('validacionAdmin')}
                    style={{ marginTop: '1.5rem', backgroundColor: '#0e2b5c', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                  >
                    Ir al Panel de Validación de Personal
                  </button>
                )}
              </div>

              <div className="user-status-card">
                <div><strong>Código / DNI:</strong> {currentUser.codigo_dni}</div>
                <div><strong>Correo:</strong> {currentUser.correo}</div>
                <div><strong>Estado:</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>● Activo</span></div>
              </div>
            </div>

            {/* Módulos de la Aplicación */}
            <h3 className="modules-title">
              Módulos del Sistema (Próximas Iteraciones)
            </h3>

            <div className="modules-grid">
              <div className="module-card">
                <div className="module-icon">🏛️</div>
                <h4>Reserva de Espacios (HU-S01)</h4>
                <p>
                  Reserva de auditorio, aulas de cómputo, laboratorios o salas de estudio de la facultad.
                </p>
                <span className="module-badge">Disponible en Iteración 2</span>
              </div>

              <div className="module-card">
                <div className="module-icon">💻</div>
                <h4>Préstamo de Recursos (HU-S02)</h4>
                <p>
                  Solicitud de proyectores, laptops, cables y accesorios para presentaciones académicas.
                </p>
                <span className="module-badge">Disponible en Iteración 2</span>
              </div>

              <div className="module-card">
                <div className="module-icon">📋</div>
                <h4>Historial de Solicitudes (HU-S03)</h4>
                <p>
                  Seguimiento en tiempo real del estado de tus solicitudes (Aprobado, En Revisión, Rechazado).
                </p>
                <span className="module-badge">Disponible en Iteración 2</span>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;