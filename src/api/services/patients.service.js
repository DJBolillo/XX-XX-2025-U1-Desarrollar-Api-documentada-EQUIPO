// src/api/services/patients.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function sendAppointmentReminderService(idPaciente, idCita, via) {
  const appointmentRef = db.collection('appointments').doc(idCita);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) {
    throw new Error("Cita no encontrada");
  }
  await appointmentRef.update({ reminderSent: true, via: via || 'email' });
  return { message: "Recordatorio enviado correctamente" };
}

async function confirmAppointmentStatusService(idPaciente, idCita, confirmada) {
  if (isNaN(parseInt(idPaciente))) throw new Error("ID de paciente inválido");

  const appointmentRef = db.collection('appointments').doc(idCita);
  const appointmentDoc = await appointmentRef.get();

  if (!appointmentDoc.exists || appointmentDoc.data().patientId !== idPaciente) {
    throw new Error("Cita no encontrada");
  }

  await appointmentRef.update({ confirmada });

  return {
    mensaje: "Estado de confirmación actualizado correctamente",
    idCita,
    confirmada
  };
}

module.exports = { sendAppointmentReminderService, confirmAppointmentStatusService };
