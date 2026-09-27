import 'dotenv/config';
import app from './app.js';
import { initDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  Servidor FISI Backend iniciado en puerto ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health`);
      console.log(`  Auth API:    http://localhost:${PORT}/api/auth`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor backend:', err);
    process.exit(1);
  }
}

startServer();
