import { UserModel } from '../models/userModel.js';
import { sendValidationApprovalEmail, sendValidationRejectionEmail } from '../services/emailService.js';

export const AdminController = {
  // Criterio 2 y 3 (HU-U02): Listar solicitudes pendientes de validación
  async getPendingValidations(req, res) {
    try {
      const pendientes = await UserModel.findPendingValidations();
      return res.status(200).json({
        success: true,
        total: pendientes.length,
        pendientes
      });
    } catch (error) {
      console.error('[Error en getPendingValidations]:', error);
      return res.status(500).json({ message: 'Error al obtener la lista de personal administrativo pendiente.' });
    }
  },

  // Criterio 3 y 4 (HU-U02): Aprobar solicitud y habilitar rol administrativo
  async approveValidation(req, res) {
    try {
      const { id } = req.params;

      const usuario = await UserModel.findById(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      await UserModel.approveValidation(id);

      // Notificación por correo al usuario
      await sendValidationApprovalEmail({
        destinatario: usuario.correo,
        nombre: usuario.nombre
      });

      return res.status(200).json({
        success: true,
        message: `Personal administrativo ${usuario.nombre} aprobado exitosamente.`
      });
    } catch (error) {
      console.error('[Error en approveValidation]:', error);
      return res.status(500).json({ message: 'Error interno al aprobar la solicitud administrativa.' });
    }
  },

  // Criterio 3 y 5 (HU-U02): Rechazar solicitud con motivo y notificación
  async rejectValidation(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo || !motivo.trim()) {
        return res.status(400).json({ message: 'Debe ingresar el motivo de rechazo de la solicitud.' });
      }

      const usuario = await UserModel.findById(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      const cleanMotivo = motivo.trim();
      await UserModel.rejectValidation(id, cleanMotivo);

      // Criterio 5: Notificación con el motivo
      await sendValidationRejectionEmail({
        destinatario: usuario.correo,
        nombre: usuario.nombre,
        motivo: cleanMotivo
      });

      return res.status(200).json({
        success: true,
        message: `Solicitud de ${usuario.nombre} rechazada con el motivo registrado.`
      });
    } catch (error) {
      console.error('[Error en rejectValidation]:', error);
      return res.status(500).json({ message: 'Error interno al procesar el rechazo de la solicitud.' });
    }
  }
};
