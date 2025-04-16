// src/api/services/doctors.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();


 
// Eliminar un doctor MIO
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
