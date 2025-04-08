// controllers/users.controller.js
const { updateUserService } = require('../services/users.service');

// Actualiza un recurso de usuario (por ejemplo, mediante un PUT)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateUserService(id, updateData);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updateUser:", error);
    res.status(500).json({ error: "Ocurrió un error al actualizar el usuario. Intente nuevamente más tarde." });
  }
}

module.exports = { updateUser };
