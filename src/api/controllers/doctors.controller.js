// controllers/doctors.controller.js
const {
  getDoctorsListService,
  addOneDoctorService,
  updateDoctorDataService,
  giveDoctorVacationsService,
  getAppointmentByIdService,
  deleteDoctorService,
  getDoctorAvailabilityService,
  getSpecialtiesService
} = require('../services/doctors.service');

// Lista todos los doctores registrados
async function getDoctorsList(req, res) {
  try {
    const doctors = await getDoctorsListService();
    if (!doctors.length) {
      return res.status(404).json({ error: "No hay médicos registrados en el sistema" });
    }
    res.status(200).json({ doctores: doctors });
  } catch (error) {
    console.error("Error getDoctorsList:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener la lista de médicos. Intente nuevamente más tarde." });
  }
}

// Registra un nuevo doctor
async function addOneDoctor(req, res) {
  try {
    const doctorData = req.body;
    const result = await addOneDoctorService(doctorData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error addOneDoctor:", error);
    if (error.code === 409) {
      res.status(409).json({ error: "La cédula profesional ya está registrada para otro doctor" });
    } else if (error.message.includes("Faltan campos obligatorios")) {
      res.status(400).json({ error: "Faltan campos obligatorios o formato inválido. Verifique los datos enviados." });
    } else {
      res.status(500).json({ error: "Ocurrió un error al registrar el doctor. Intente nuevamente más tarde." });
    }
  }
}


async function updateDoctorData(req, res) {
  try {
    const { idDoctor } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Datos inválidos o vacíos" });
    }

    const result = await updateDoctorDataService(idDoctor, updateData);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error updateDoctorData:", error.message);

    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Error al actualizar el doctor" });
  }
}
async function giveDoctorVacations(req, res) {
  try {
    const { idDoctor } = req.params;
    const { startDate, endDate } = req.body;

    const result = await giveDoctorVacationsService(idDoctor, startDate, endDate);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error giveDoctorVacations:", error.message);

    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(409).json({ error: "Conflicto al asignar vacaciones." });
  }
}
// Obtiene los detalles de una cita específica, dado el ID del doctor y de la cita
async function getAppointmentById(req, res) {
  try {
    const { idDoctor, idCita } = req.params;
    const result = await getAppointmentByIdService(idDoctor, idCita);
    if (!result) {
      return res.status(404).json({ message: "cita no encontrada" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getAppointmentById:", error);
    if (error.message.includes("ID inválido")) {
      res.status(400).json({ message: "ID inválido" });
    } else {
      res.status(500).json({ error: "Ocurrió un error al intentar consultar su cita. Intente nuevamente más tarde." });
    }
  }
}

// Elimina un doctor (si no tiene citas pendientes)
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
// Obtiene la disponibilidad de un médico específico
async function getDoctorAvailability(req, res) {
  try {
    const { id } = req.params;
    const result = await getDoctorAvailabilityService(id);
    if (!result) {
      return res.status(404).json({ error: "No se encontró un médico con el ID proporcionado" });
    }
    res.status(200).json({ disponibilidad: result });
  } catch (error) {
    console.error("Error getDoctorAvailability:", error);
    res.status(500).json({ error: "Ocurrió un problema en el servidor, inténtelo más tarde" });
  }
}

// Lista todas las especialidades médicas disponibles
async function getSpecialties(req, res) {
  try {
    const result = await getSpecialtiesService();
    if (!result.length) {
      return res.status(404).json({ error: "No hay especialidades médicas registradas en el sistema" });
    }
    res.status(200).json({ especialidades: result });
  } catch (error) {
    console.error("Error getSpecialties:", error);
    res.status(500).json({ error: "Ocurrió un problema en el servidor, inténtelo más tarde." });
  }
}

module.exports = {
  getDoctorsList,
  addOneDoctor,
  updateDoctorData,
  giveDoctorVacations,
  getAppointmentById,
  deleteDoctor,
  getDoctorAvailability,
  getSpecialties
};
