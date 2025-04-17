// controllers/appointments.controller.js
const {
  getAppointmentsTodayService,
  getAppointmentsHistoryService,
  getAppointmentsByDateService,
  getAppointmentsByPatientService,
  getAppointmentsByPatientNameService,
  addOneAppointmentService,
  delegateAppointmentService
} = require('../services/appointments.service');

// 1. Obtiene las citas del día para un doctor
async function getAppointmentsToday(req, res) {
  try {
    const { doctorId } = req.params;
    
    const appointments = await getAppointmentsTodayService(doctorId);
    if (!appointments.length) {
      return res.status(200).json({ mensaje: "No tiene citas agendadas para hoy" });
    }
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error getAppointmentsToday:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los datos. Por favor, intente nuevamente más tarde." });
  }

}
// 3. Obtiene el historial de citas de un doctor (ordenado de reciente a antiguo)
async function getAppointmentsHistory(req, res) {
  try {
    const { doctorId } = req.params;

    // Validación básica del ID (podrías agregar más validaciones)
    if (!doctorId) {
      return res.status(400).json({ error: "ID de doctor no proporcionado" });
    }

    const appointments = await getAppointmentsHistoryService(doctorId);

    if (!appointments.length) {
      return res.status(200).json({ 
        mensaje: "El doctor no tiene citas pasadas registradas" 
      });
    }

    res.status(200).json({ appointments });

  } catch (error) {
    console.error("Error en getAppointmentsHistory:", error);

    // Manejo de errores específicos
    const statusCode = error.status || 500;
    const message = error.message || "Error al obtener el historial de citas";

    res.status(statusCode).json({ error: message });
  }
}

// Obtiene las citas programadas para una fecha específica
// 2. Obtiene las citas programadas para una fecha específica
async function getAppointmentsByDate(req, res) {
  try {
    const { doctorId, date } = req.params;
    const appointments = await getAppointmentsByDateService(doctorId, date);
    if (!appointments.length) {
      return res.status(200).json({ mensaje: "No hay citas agendadas para la fecha seleccionada" });
    }
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error getAppointmentsByDate:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los datos. Por favor, intente nuevamente más tarde." });
  }
}


// 4. Obtiene las citas entre un doctor y un paciente específico
async function getAppointmentsByPatient(req, res) {
  try {
    const { doctorId, patientId } = req.params;

    // Validación adicional (opcional pero recomendada)
    if (!doctorId || !patientId) {
      return res.status(400).json({ error: "Se requieren doctorId y patientId" });
    }

    const appointments = await getAppointmentsByPatientService(doctorId, patientId);

    if (!appointments.length) {
      return res.status(200).json({ 
        mensaje: "El paciente no tiene citas agendadas con este doctor" 
      });
    }

    res.status(200).json({ appointments });

  } catch (error) {
    console.error("Error getAppointmentsByPatient:", error);
    // Maneja errores específicos (ej: "Doctor no encontrado")
    const statusCode = error.message.includes("no encontrado") ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
}

// Filtra citas por nombre del paciente (consulta mediante query string)
async function getAppointmentsByPatientName(req, res) {
  try {
    const { patientName } = req.query;
    if (!patientName) {
      return res.status(400).json({ message: "El parámetro 'patientName' es requerido" });
    }
    const appointments = await getAppointmentsByPatientNameService(patientName);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error getAppointmentsByPatientName:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los datos. Por favor, intente nuevamente más tarde." });
  }
}

// Crea una nueva cita para un paciente
async function addOneAppointment(req, res) {
  try {
    const { paciente, fechaHora, idCita } = req.body;

    if (!paciente || !fechaHora || !idCita) {
      return res.status(400).json({ error: "Faltan campos requeridos: paciente, fechaHora o idCita" });
    }

    const result = await addOneAppointmentService({ paciente, fechaHora, idCita });
    res.status(201).json(result);

  } catch (error) {
    console.error("Error addOneAppointment:", error.message);
    res.status(500).json({ error: error.message || "Ocurrió un error al crear la cita." });
  }
}
// Reasigna una cita a otro doctor
async function delegateAppointment(req, res) {
  try {
    const { idCita } = req.params;
    const { nuevoDoctorId } = req.body;

    if (!nuevoDoctorId) {
      return res.status(400).json({ error: "El campo 'nuevoDoctorId' es requerido" });
    }

    const result = await delegateAppointmentService(idCita, nuevoDoctorId);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Error delegateAppointment:", error.message);

    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: "Ocurrió un error al delegar la cita." });
  }
}

module.exports = {
  getAppointmentsToday,
  getAppointmentsHistory,
  getAppointmentsByDate,
  getAppointmentsByPatient,
  getAppointmentsByPatientName,
  addOneAppointment,
  delegateAppointment
};
