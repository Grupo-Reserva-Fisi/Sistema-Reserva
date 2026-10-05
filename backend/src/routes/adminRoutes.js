import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de administración requieren autenticación y rol 'administrativo'
router.use(verifyToken, verifyRole('administrativo'));

// HU-U02: Endpoints de Validación de Personal Administrativo
router.get('/pendientes', AdminController.getPendingValidations);
router.put('/usuarios/:id/aprobar', AdminController.approveValidation);
router.put('/usuarios/:id/rechazar', AdminController.rejectValidation);

export default router;
