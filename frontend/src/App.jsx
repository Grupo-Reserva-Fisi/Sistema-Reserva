import React, { useState } from 'react';
import Login from './components/Login';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div>
      {!currentUser ? (
        <Login onLoginSuccess={(usuario) => setCurrentUser(usuario)} />
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Bienvenido, {currentUser.nombre}</h2>
          <p>Rol: <strong>{currentUser.rol}</strong></p>
          <button 
            onClick={() => setCurrentUser(null)}
            style={{
              backgroundColor: '#b91c1c',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default App;