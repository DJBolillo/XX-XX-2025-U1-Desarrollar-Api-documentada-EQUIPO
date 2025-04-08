// src/api/services/appointments.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function getAppointmentsTodayService(doctorId) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD (sin la hora)
  const today = new Date().toISOString().split('T')[0];

  // Obtener el documento del doctor con el ID proporcionado
  const doctorDoc = await db.collection('doctors').doc(doctorId).get();

  if (!doctorDoc.exists) {
    throw new Error("Doctor no encontrado");
  }

  // Obtener las citas del doctor
  const doctorData = doctorDoc.data();
  const citasHoy = [];

  // Filtrar las citas que ocurren hoy
  doctorData.citas.forEach(cita => {
    const fechaCita = cita.fechaHora.split('T')[0];  // Extrae solo la fecha (sin la hora)
    
    // Si la fecha de la cita es igual a la fecha de hoy, la añadimos a la lista
    if (fechaCita === today) {
      citasHoy.push(cita);
    }
  });

  // Devuelve las citas de hoy
  return citasHoy;
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
  // Obtener el documento del doctor usando el ID
  const doctorDoc = await db.collection('doctors').doc(doctorId).get();

  if (!doctorDoc.exists) {
    throw new Error("Doctor no encontrado");
  }

  // Obtener los datos del doctor
  const doctorData = doctorDoc.data();

  // Filtrar las citas que coinciden con la fecha proporcionada
  const appointmentsOnDate = doctorData.citas.filter(cita => {
    // Compara solo la fecha (sin la hora) de la cita
    const citaDate = cita.fechaHora.split('T')[0];  // Extrae la fecha (sin la hora)
    return citaDate === date;
  });

  return appointmentsOnDate;
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
