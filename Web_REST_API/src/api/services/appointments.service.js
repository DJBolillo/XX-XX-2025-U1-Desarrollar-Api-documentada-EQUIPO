// src/api/services/appointments.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

// 1. Obtener todas las citas programadas para el día de un doctor específico.
async function getAppointmentsTodayService(doctorId) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD (sin la hora)
  const today = new Date().toISOString().split('T')[0];

  // Obtener el documento del doctor con el ID proporcionado
  const doctorDoc = await db.collection('doctors').doc(doctorId).get();

  // Validación y error con código 400
  if (!doctorDoc.exists) {
    const error = new Error("Doctor no encontrado");
    error.status = 400; // Error de cliente: solicitud inválida
    throw error;
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
  return citasHoy;
}


// 3. Obtiene el historial de citas de un doctor (ordenado de reciente a antiguo)
async function getAppointmentsHistoryService(doctorId) {
  try {
    // Validar que el doctorId no esté vacío
    if (!doctorId) {
      throw new Error("ID de doctor no proporcionado");
    }

    const today = new Date().toISOString().split('T')[0]; // Fecha de hoy (YYYY-MM-DD)

    // Obtener el documento del doctor
    const doctorDoc = await db.collection('doctors').doc(doctorId).get();

    if (!doctorDoc.exists) {
      const error = new Error("Doctor no encontrado");
      error.status = 400; // Bad Request
      throw error;
    }

    const doctorData = doctorDoc.data();

    // Verificar si el doctor tiene citas
    if (!doctorData.citas || !Array.isArray(doctorData.citas)) {
      return []; // Retorna array vacío si no hay citas
    }

    // Filtrar y ordenar citas
    const pastAppointments = doctorData.citas
      .filter(cita => {
        if (!cita.fechaHora) return false; // Ignorar citas sin fecha
        const citaDate = cita.fechaHora.split('T')[0];
        return citaDate < today;
      })
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)); // Orden descendente

    return pastAppointments;

  } catch (error) {
    console.error("Error en getAppointmentsHistoryService:", error);
    throw error; // Re-lanzar el error para el controlador
  }
}


// 2. Obtener todas las citas programadas para una fecha específica de un doctor.
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

//4. Obtiene citar entre un paciente y un doctor
async function getAppointmentsByPatientService(doctorId, patientId) {
  // 1. Obtener el documento del doctor
  const doctorRef = db.collection('doctors').doc(doctorId);
  const doctorDoc = await doctorRef.get();

  if (!doctorDoc.exists) {
    throw new Error("Doctor no encontrado");
  }

  // 2. Verificar si tiene citas
  const doctorData = doctorDoc.data();
  if (!doctorData.citas || !Array.isArray(doctorData.citas)) {
    return []; // Retorna array vacío si no hay citas
  }

  // 3. Filtrar citas por NSS del paciente (como string)
  const citasPaciente = doctorData.citas.filter(cita => {
    return cita.nss === patientId.toString(); // Asegura comparar strings
  });

  return citasPaciente;
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
  const { paciente, fechaHora, idCita } = appointmentData;

  if (!paciente || !fechaHora || !idCita) {
    throw new Error("Faltan campos requeridos: paciente, fechaHora o idCita");
  }

  const doctorsSnapshot = await db.collection("doctors").get();
  for (const doc of doctorsSnapshot.docs) {
    const citas = doc.data().citas || [];
    const yaExiste = citas.some(c => c.idCita === idCita);
    if (yaExiste) {
      throw new Error(`Ya existe una cita con el ID '${idCita}'`);
    }
  }

  let doctorDisponible = null;
  for (const doc of doctorsSnapshot.docs) {
    const citas = doc.data().citas || [];
    const conflicto = citas.some(c => c.fechaHora === fechaHora);
    if (!conflicto) {
      doctorDisponible = doc;
      break;
    }
  }

  if (!doctorDisponible) {
    throw new Error("No hay doctores disponibles en ese horario");
  }

  const nuevaCita = { paciente, fechaHora, idCita };
  const citasActuales = doctorDisponible.data().citas || [];
  citasActuales.push(nuevaCita);

  await doctorDisponible.ref.update({ citas: citasActuales });

  return {
    message: "Cita creada exitosamente",
    doctorId: doctorDisponible.id,
    cita: nuevaCita
  };
}

async function delegateAppointmentService(idCita, nuevoDoctorId) {
  const doctorsSnapshot = await db.collection("doctors").get();
  let doctorActual = null;
  let citaEncontrada = null;

  for (const doc of doctorsSnapshot.docs) {
    const citas = doc.data().citas || [];
    const cita = citas.find(c => String(c.idCita) === String(idCita));
    if (cita) {
      doctorActual = doc;
      citaEncontrada = cita;
      break;
    }
  }

  if (!doctorActual || !citaEncontrada) {
    const error = new Error("No se encontró la cita");
    error.status = 404;
    throw error;
  }

  const nuevoDoctorRef = db.collection("doctors").doc(nuevoDoctorId);
  const nuevoDoctorDoc = await nuevoDoctorRef.get();

  if (!nuevoDoctorDoc.exists) {
    const error = new Error("El nuevo médico no es válido");
    error.status = 400;
    throw error;
  }

  const citasNuevo = nuevoDoctorDoc.data().citas || [];
  const conflicto = citasNuevo.some(c => c.fechaHora === citaEncontrada.fechaHora);

  if (conflicto) {
    const error = new Error("El nuevo médico ya tiene una cita en ese horario");
    error.status = 400;
    throw error;
  }

  const nuevasCitasActual = doctorActual.data().citas.filter(c => c.idCita !== idCita);
  await doctorActual.ref.update({ citas: nuevasCitasActual });

  const nuevasCitasNuevo = [...citasNuevo, citaEncontrada];
  await nuevoDoctorRef.update({ citas: nuevasCitasNuevo });

  return { message: "Médico asignado correctamente a la cita." };
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
