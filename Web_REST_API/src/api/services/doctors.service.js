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
  const doctorRef = db.collection("doctors").doc(idDoctor);
  const doctorDoc = await doctorRef.get();

  if (!doctorDoc.exists) {
    const error = new Error("Doctor no encontrado");
    error.status = 404;
    throw error;
  }

  if ('especialidad' in updateData) {
    const error = new Error("No se permite modificar la especialidad");
    error.status = 400;
    throw error;
  }

  const camposPermitidos = ['nombre', 'idDoctor'];
  const datosFiltrados = {};
  camposPermitidos.forEach(campo => {
    if (campo in updateData) datosFiltrados[campo] = updateData[campo];
  });

  if (Object.keys(datosFiltrados).length === 0) {
    const error = new Error("No se proporcionaron campos válidos para actualizar");
    error.status = 400;
    throw error;
  }

  if ('idDoctor' in datosFiltrados && datosFiltrados.idDoctor !== idDoctor) {
    const nuevoId = datosFiltrados.idDoctor;
    await db.collection("doctors").doc(nuevoId).set({
      ...doctorDoc.data(),
      ...datosFiltrados
    });
    await doctorRef.delete();

    return { message: `Doctor actualizado y movido al nuevo ID '${nuevoId}'. `};
  }

  await doctorRef.update(datosFiltrados);
  return { message: "Datos del doctor actualizados correctamente." };
}


async function giveDoctorVacationsService(idDoctor, startDate, endDate) {
  const doctorRef = db.collection('doctors').doc(idDoctor);
  const doctorDoc = await doctorRef.get();

  if (!doctorDoc.exists) {
    const error = new Error("Doctor no encontrado");
    error.status = 404;
    throw error;
  }

  const today = new Date().toISOString().split('T')[0];
  if (startDate < today || endDate < today) {
    const error = new Error("conflicto en las fechas de vacaciones.");
    error.status = 400;
    throw error;
  }

  if (!startDate && !endDate) {
    await doctorRef.update({ vacaciones: admin.firestore.FieldValue.delete() });
    return { message: "Vacaciones eliminadas correctamente." };
  }

  await doctorRef.update({
    vacaciones: { startDate, endDate }
  });

  return { message: "Vacaciones asignadas correctamente." };
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

async function deleteDoctorService(id) {
  if (!id.match(/^[a-zA-Z0-9]+$/)) {
    throw new Error("El ID proporcionado no es válido o tiene un formato incorrecto");
  }

  const doctorRef = db.collection('doctors').doc(id);
  const doctorDoc = await doctorRef.get();
  if (!doctorDoc.exists) {
    throw new Error("No existe un doctor con el ID proporcionado en la base de datos");
  }

  const citas = await db.collection('appointments')
    .where('idDoctor', '==', id)
    .where('estado', '==', 'pendiente')
    .get();

  if (!citas.empty) {
    throw new Error("El doctor tiene citas activas y no puede ser eliminado");
  }

  await doctorRef.delete();
  return { mensaje: "Doctor eliminado exitosamente" };
}


module.exports = {
  deleteDoctorService
};

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
  deleteDoctorService,
  getDoctorAvailabilityService,
  getSpecialtiesService
};
