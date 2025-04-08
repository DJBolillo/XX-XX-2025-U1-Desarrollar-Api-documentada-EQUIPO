// src/api/services/users.service.js
const { admin } = require('../../../config/firebase'); // Ruta actualizada
const db = admin.firestore();

async function updateUserService(id, updateData) {
  const userRef = db.collection('users').doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error("Usuario no encontrado");
  }
  await userRef.update(updateData);
  return { message: "Usuario actualizado correctamente" };
}

module.exports = { updateUserService };
