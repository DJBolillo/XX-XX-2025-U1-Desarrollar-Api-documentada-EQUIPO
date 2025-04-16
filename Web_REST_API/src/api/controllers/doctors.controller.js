// controllers/doctors.controller.js
const {
  deleteDoctorService
} = require('../services/doctors.service');



// Elimina un doctor (si no tiene citas pendientes) MIO
async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteDoctorService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleteDoctor:", error);
    if (error.message.includes("formato incorrecto")) {
      res.status(400).json({ error: "El ID proporcionado no es válido o tiene un formato incorrecto" });
    } else if (error.message.includes("no existe")) {
      res.status(404).json({ error: "No existe un doctor con el ID proporcionado en la base de datos" });
    } else if (error.message.includes("citas activas")) {
      res.status(409).json({ error: "El doctor tiene citas activas y no puede ser eliminado hasta que se reasignen o cancelen" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al eliminar el doctor" });
    }
  }
}
module.exports = {
  deleteDoctor
};
