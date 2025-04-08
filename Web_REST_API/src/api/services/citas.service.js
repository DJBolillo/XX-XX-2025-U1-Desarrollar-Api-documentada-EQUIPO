// src/api/services/citas.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function changeDoctorRequestService(id, nuevo_medico_id, motivo) {
  const appointmentRef = db.collection('appointments').doc(id);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) {
    throw new Error("No se encontró una cita");
  }
  await appointmentRef.update({ doctorId: nuevo_medico_id, changeReason: motivo });
  return { message: "Cambio de médico solicitado exitosamente" };
}

async function deleteAppointmentService(id) {
  const appointmentRef = db.collection('appointments').doc(id);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) {
    throw new Error("No existe una cita con el ID proporcionado");
  }
  const data = appointmentDoc.data();
  if (new Date(data.date) < new Date()) {
    throw new Error("La cita ya pasó");
  }
  await appointmentRef.delete();
  return { message: "Cita cancelada exitosamente" };
}

module.exports = { changeDoctorRequestService, deleteAppointmentService };
