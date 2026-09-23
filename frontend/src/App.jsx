import React, { useState } from 'react';
import Login from './components/Login';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <>
      {!currentUser ? (
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Bienvenido, {currentUser.nombre}</h2>
          <p>Rol: {currentUser.rol}</p>
          <button onClick={() => setCurrentUser(null)}>Cerrar Sesión</button>
        </div>
      )}
    </>
  );
}

export default App;