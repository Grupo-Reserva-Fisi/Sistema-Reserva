import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificación de estado (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Sistema de Reservas FISI Backend API',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador global de errores (500)
app.use((err, req, res, next) => {
  console.error('[Error Global]:', err.stack);
  res.status(500).json({ message: 'Error interno en el servidor.' });
});

export default app;
