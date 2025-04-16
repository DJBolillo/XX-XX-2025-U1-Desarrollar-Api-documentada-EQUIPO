// src/api/services/users.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

//actualizar un usuario
async function updatePatientService(id, data) {
  if (!id || typeof id !== "string") {
    throw { status: 400, message: "ID inválido" };
  }

  const docRef = admin.firestore().collection("patients").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw { status: 404, message: "Paciente no encontrado" };
  }

  // Validación simple del cuerpo
  const { nombre, telefono, edad } = data;
  if (!nombre || !telefono || !edad) {
    throw { status: 400, message: "Faltan datos obligatorios" };
  }

  await docRef.update({ nombre, telefono, edad });
  return { message: "Paciente actualizado correctamente" };
}


module.exports = { updatePatientService };
