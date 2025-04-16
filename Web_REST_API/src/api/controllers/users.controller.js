// controllers/users.controller.js
const { updatePatientService } = require('../services/users.service');

//actualizar un usuario
async function updatePatientController(req, res) {
  const { id } = req.params;
  const data = req.body;

  try {
    const result = await updatePatientService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Error interno" });
  }
}


module.exports = { updatePatientController };
