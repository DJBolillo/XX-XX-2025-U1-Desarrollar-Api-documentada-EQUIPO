// src/api/services/citas.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function eliminarCitaService(idCita) {
  if (!idCita || isNaN(idCita)) {
    throw { code: 400, message: "El ID de la cita no es válido" };
  }

  const doctorsSnapshot = await db.collection('doctors').get();
  let citaEncontrada = null;
  let doctorRef = null;
  let indexCita = -1;
  let citasOriginal = [];

  for (const doc of doctorsSnapshot.docs) {
    const citas = doc.data().citas || [];

    citas.forEach((cita, index) => {
      if (cita.idCita == idCita) {
        citaEncontrada = cita;
        doctorRef = doc.ref;
        indexCita = index;
        citasOriginal = citas;
      }
    });

    if (citaEncontrada) break;
  }

  if (!citaEncontrada) {
    throw { code: 404, message: "No existe una cita con el ID proporcionado" };
  }

  const fechaCita = new Date(citaEncontrada.fechaHora);
  const ahora = new Date();
  const mismaFecha = fechaCita.toDateString() === ahora.toDateString();

  if (fechaCita < ahora) {
    throw { code: 403, message: "La cita ya pasó y no puede ser cancelada" };
  }

  if (mismaFecha) {
    throw { code: 409, message: "La cita no pudo ser eliminada" };
  }

  citasOriginal.splice(indexCita, 1);
  await doctorRef.update({ citas: citasOriginal });

  return "Cita cancelada exitosamente";
}

// Solicita un cambio de médico
async function cambiarMedico(citaId, nuevoMedicoId, motivo) {
  const snapshot = await db.collection('doctors').get();

  let citaEncontrada = null;
  let doctorActualRef = null;
  let indexCita = -1;

  snapshot.forEach(doc => {
    const citas = doc.data().citas || [];
    const index = citas.findIndex(c => c.idCita === parseInt(citaId));

    if (index !== -1) {
      citaEncontrada = citas[index];
      doctorActualRef = doc.ref;
      indexCita = index;
    }
  });

  if (!citaEncontrada) {
    const error = new Error("No se encontró una cita con el ID proporcionado");
    error.code = 404;
    throw error;
  }

  const nuevoMedicoDoc = await db.collection('doctors').doc(nuevoMedicoId).get();

  if (!nuevoMedicoDoc.exists) {
    const error = new Error("El médico solicitado no existe");
    error.code = 505;
    throw error;
  }

  const disponibilidad = nuevoMedicoDoc.data().disponibilidad || [];
  const fechaHoraCita = citaEncontrada.fechaHora;

  const disponible = disponibilidad.some(
    disp => disp.fechaHora === fechaHoraCita
  );

  if (!disponible) {
    const error = new Error("El médico solicitado no está disponible en la fecha y hora de la cita");
    error.code = 505;
    throw error;
  }

  const solicitudCambio = {
    nuevoMedicoId,
    motivo,
    estado: "Pendiente de aprobación",
    fechaSolicitud: new Date().toISOString()
  };

  await doctorActualRef.update({
    [`citas.${indexCita}.solicitudCambioMedico`]: solicitudCambio
  });

  return {
    mensaje: "Solicitud de cambio de médico enviada con éxito",
    estado: "Pendiente de aprobación"
  };
}

async function confirmarAsistencia(idPaciente, idCita, confirmada) {
  if (isNaN(idPaciente)) {
    const error = new Error("ID de paciente inválido");
    error.code = 400;
    throw error;
  }

  if (typeof confirmada !== 'boolean') {
    const error = new Error("El valor de 'confirmada' debe ser true o false");
    error.code = 400;
    throw error;
  }

  const snapshot = await db.collection('doctors').get();

  let doctorRef = null;
  let keyCitaEncontrada = null;
  let citaOriginal = null;
  let citasMap = null;

  snapshot.forEach(doc => {
    const data = doc.data();
    const citas = data.citas || {};

    for (const key in citas) {
      const cita = citas[key];
      if (cita.idCita === parseInt(idCita) && cita.nss === parseInt(idPaciente)) {
        doctorRef = doc.ref;
        keyCitaEncontrada = key;
        citaOriginal = cita;
        citasMap = citas;
        break;
      }
    }
  });

  if (!citaOriginal) {
    const error = new Error("Cita no encontrada");
    error.code = 404;
    throw error;
  }

  // Modificar solo el campo confirmada
  citasMap[keyCitaEncontrada].confirmada = confirmada;

  // Subir el objeto citas entero de vuelta
  await doctorRef.update({
    citas: citasMap
  });

  return {
    mensaje: "Estado de confirmación actualizado correctamente",
    idCita: citaOriginal.idCita,
    confirmada
  };
}

module.exports = { eliminarCitaService,cambiarMedico,confirmarAsistencia};