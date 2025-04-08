// src/api/services/doctors.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function getDoctorsListService() {
  const snapshot = await db.collection('doctors').get();
  const doctors = [];
  snapshot.forEach(doc => doctors.push({ id: doc.id, ...doc.data() }));
  return doctors;
}

async function addOneDoctorService(doctorData) {
  // Verifica si la cédula ya está registrada en la base de datos
  const snapshot = await db.collection('doctors').where('cedula', '==', doctorData.cedula).get();

  // Si ya existe un doctor con esa cédula, lanza un error
  if (!snapshot.empty) {
    const error = new Error("La cédula profesional ya está registrada");
    error.code = 409;  // Código de error HTTP para conflicto
    throw error;
  }

  // Agrega el nuevo doctor a la colección 'doctors'
  const docRef = await db.collection('doctors').add(doctorData);

  // Devuelve un mensaje de éxito junto con el ID del nuevo doctor
  return { message: "Doctor agregado correctamente", id: docRef.id };
}

async function updateDoctorDataService(idDoctor, updateData) {
  if (updateData.hasOwnProperty('especialidad')) {
    throw new Error("El campo 'especialidad' no se puede modificar");
  }
  const doctorRef = db.collection('doctors').doc(idDoctor);
  const doctorDoc = await doctorRef.get();
  if (!doctorDoc.exists) {
    throw new Error("Médico no encontrado");
  }
  await doctorRef.update(updateData);
  return { message: "Datos del doctor actualizados correctamente" };
}

async function giveDoctorVacationsService(idDoctor, startDate, endDate) {
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("La fecha de inicio debe ser anterior a la fecha de finalización");
  }
  if (new Date(startDate) < new Date()) {
    throw new Error("No se pueden registrar vacaciones en fechas pasadas");
  }
  const doctorRef = db.collection('doctors').doc(idDoctor);
  const doctorDoc = await doctorRef.get();
  if (!doctorDoc.exists) {
    throw new Error(`El doctor con ID ${idDoctor} no fue encontrado`);
  }
  await doctorRef.update({ vacation: { startDate, endDate } });
  return { message: "Vacaciones asignadas correctamente" };
}

async function getAppointmentByIdService(idDoctor2, idCita) {
  const doctorRef = db.collection('doctors').doc(idDoctor2);
  const doctorDoc = await doctorRef.get();

  if (!doctorDoc.exists) return null;

  const doctorData = doctorDoc.data();
  const appointment = doctorData.citas.find(cita => cita.idCita == idCita);

  if (!appointment) return null;

  return { ...appointment, idDoctor: idDoctor2 };
}

async function deleteMedicoService(idDoctor) {
  const appointmentsSnapshot = await db.collection('appointments')
    .where('doctorId', '==', idDoctor)
    .where('status', '==', 'pending')
    .get();
  if (!appointmentsSnapshot.empty) {
    throw new Error("El doctor tiene citas activas y no puede ser eliminado hasta que se reasignen o cancelen");
  }
  await db.collection('doctors').doc(idDoctor).delete();
}

async function getDoctorAvailabilityService(idDoctor) {
  const doctorDoc = await db.collection('doctors').doc(idDoctor).get();

  if (!doctorDoc.exists) {
    return null;
  }

  const data = doctorDoc.data();
  return data.disponibilidad || [];
}

async function getSpecialtiesService() {
  const snapshot = await db.collection('especialidades').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  getDoctorsListService,
  addOneDoctorService,
  updateDoctorDataService,
  giveDoctorVacationsService,
  getAppointmentByIdService,
  deleteMedicoService,
  getDoctorAvailabilityService,
  getSpecialtiesService
};
