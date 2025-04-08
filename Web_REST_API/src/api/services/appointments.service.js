// src/api/services/appointments.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function getAppointmentsTodayService(doctorId) {
  const today = new Date().toISOString().split('T')[0];
  const snapshot = await db.collection('appointments')
    .where('doctorId', '==', doctorId)
    .where('date', '==', today)
    .get();
  const appointments = [];
  snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
  return appointments;
}

async function getAppointmentsHistoryService(doctorId) {
  const today = new Date().toISOString().split('T')[0];
  const snapshot = await db.collection('appointments')
    .where('doctorId', '==', doctorId)
    .where('date', '<', today)
    .orderBy('date', 'desc')
    .get();
  const appointments = [];
  snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
  return appointments;
}

async function getAppointmentsByDateService(doctorId, date) {
  const snapshot = await db.collection('appointments')
    .where('doctorId', '==', doctorId)
    .where('date', '==', date)
    .get();
  const appointments = [];
  snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
  return appointments;
}

async function getAppointmentsByPatientService(doctorId, patientId) {
  const snapshot = await db.collection('appointments')
    .where('doctorId', '==', doctorId)
    .where('patientId', '==', patientId)
    .get();
  const appointments = [];
  snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
  return appointments;
}

async function getAppointmentsByPatientNameService(patientName) {
  const snapshot = await db.collection('appointments')
    .where('patientName', '==', patientName)
    .get();
  const appointments = [];
  snapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));
  return appointments;
}

async function addOneAppointmentService(appointmentData) {
  const docRef = await db.collection('appointments').add(appointmentData);
  return { message: "Cita creada exitosamente", id: docRef.id };
}

async function delegateAppointmentService(idCita, nuevoDoctorId) {
  const appointmentRef = db.collection('appointments').doc(idCita);
  const appointmentDoc = await appointmentRef.get();
  if (!appointmentDoc.exists) {
    throw new Error("No existe una cita con el ID proporcionado");
  }
  await appointmentRef.update({ doctorId: nuevoDoctorId });
  return { message: "Cita delegada exitosamente" };
}

module.exports = {
  getAppointmentsTodayService,
  getAppointmentsHistoryService,
  getAppointmentsByDateService,
  getAppointmentsByPatientService,
  getAppointmentsByPatientNameService,
  addOneAppointmentService,
  delegateAppointmentService
};
