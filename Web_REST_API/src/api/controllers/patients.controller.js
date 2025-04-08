// controllers/patients.controller.js
const {
  sendAppointmentReminderService,
  confirmAppointmentStatusService
} = require('../services/patients.service');

// Envía un recordatorio para una cita
async function sendAppointmentReminder(req, res) {
  try {
    const { idPaciente, idCita } = req.params;
    const { via } = req.body; // Medio de envío (email, sms, notificacion, etc.)
    const result = await sendAppointmentReminderService(idPaciente, idCita, via);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sendAppointmentReminder:", error);
    if (error.message.includes("Cita no encontrada")) {
      res.status(404).json({ message: "Cita no encontrada" });
    } else if (error.message.includes("ID de paciente inválido")) {
      res.status(400).json({ message: "ID de paciente inválido" });
    } else if (error.message.includes("ID de cita inválido")) {
      res.status(400).json({ message: "ID de cita inválido" });
    } else if (error.message.includes("Medio de envío inválido")) {
      res.status(400).json({ message: "Medio de envío inválido. Valores aceptados: email, sms, notificacion" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al intentar enviar su recordatorio. Intente nuevamente más tarde." });
    }
  }
}

// Confirma o desconfirma la asistencia a una cita
async function confirmAppointmentStatus(req, res) {
  try {
    const { idPaciente, idCita } = req.params;
    const { confirmada } = req.body;
    if (typeof confirmada !== 'boolean') {
      return res.status(400).json({ message: "El valor de 'confirmada' debe ser true o false" });
    }
    const result = await confirmAppointmentStatusService(idPaciente, idCita, confirmada);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error confirmAppointmentStatus:", error);
    if (error.message.includes("Cita no encontrada")) {
      res.status(404).json({ message: "Cita no encontrada" });
    } else if (error.message.includes("ID de paciente inválido")) {
      res.status(400).json({ message: "ID de paciente inválido" });
    } else if (error.message.includes("El campo 'confirmada' es obligatorio")) {
      res.status(400).json({ message: "El campo 'confirmada' es obligatorio" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al intentar cambiar su confirmacion. Intente nuevamente más tarde." });
    }
  }
}

module.exports = {
  sendAppointmentReminder,
  confirmAppointmentStatus
};
