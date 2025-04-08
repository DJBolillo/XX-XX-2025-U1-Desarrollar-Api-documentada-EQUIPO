// controllers/citas.controller.js
const {
  changeDoctorRequestService,
  deleteAppointmentService
} = require('../services/citas.service');

// Permite solicitar el cambio de médico asignado a una cita
async function changeDoctorRequest(req, res) {
  try {
    const { id } = req.params;
    const { nuevo_medico_id, motivo } = req.body;
    const result = await changeDoctorRequestService(id, nuevo_medico_id, motivo);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error changeDoctorRequest:", error);
    if (error.message.includes("No se encontró una cita")) {
      res.status(404).json({ error: "No se encontró una cita con el ID proporcionado" });
    } else if (error.message.includes("El médico solicitado no está disponible")) {
      res.status(505).json({ error: "El médico solicitado no está disponible en la fecha y hora de la cita" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al solicitar el cambio de médico. Intente nuevamente más tarde." });
    }
  }
}

// Cancela una cita
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    await deleteAppointmentService(id);
    res.status(200).json({ mensaje: "Cita cancelada exitosamente" });
  } catch (error) {
    console.error("Error deleteAppointment:", error);
    if (error.message.includes("El ID proporcionado no es válido")) {
      res.status(400).json({ error: "El ID proporcionado no es válido" });
    } else if (error.message.includes("No existe una cita")) {
      res.status(404).json({ error: "No existe una cita con el ID proporcionado" });
    } else if (error.message.includes("La cita ya pasó")) {
      res.status(403).json({ error: "La cita ya pasó y no puede ser cancelada" });
    } else if (error.message.includes("La cita no pudo ser eliminada")) {
      res.status(409).json({ error: "La cita no pudo ser eliminada" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al cancelar la cita. Intente nuevamente más tarde." });
    }
  }
}

module.exports = {
  changeDoctorRequest,
  deleteAppointment
};
