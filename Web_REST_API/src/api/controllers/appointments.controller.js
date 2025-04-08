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

// Obtiene las citas del día para un doctor
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

// Obtiene el historial de citas de un doctor (ordenado de reciente a antiguo)
async function getAppointmentsHistory(req, res) {
  try {
    const { doctorId } = req.params;
    const appointments = await getAppointmentsHistoryService(doctorId);
    if (!appointments.length) {
      return res.status(200).json({ mensaje: "No tiene citas agendadas el doctor" });
    }
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error getAppointmentsHistory:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los datos. Por favor, intente nuevamente más tarde." });
  }
}

// Obtiene las citas programadas para una fecha específica
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

// Obtiene las citas entre un doctor y un paciente específico
async function getAppointmentsByPatient(req, res) {
  try {
    const { doctorId, patientId } = req.params;
    const appointments = await getAppointmentsByPatientService(doctorId, patientId);
    if (!appointments.length) {
      return res.status(200).json({ mensaje: "El paciente no tiene citas agendadas con este doctor" });
    }
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error getAppointmentsByPatient:", error);
    res.status(500).json({ error: "Ocurrió un error al obtener los datos. Por favor, intente nuevamente más tarde." });
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
    const appointmentData = req.body;
    const result = await addOneAppointmentService(appointmentData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error addOneAppointment:", error);
    res.status(500).json({ error: "Ocurrió un error al crear la cita. Intente nuevamente más tarde." });
  }
}

// Reasigna una cita a otro doctor
async function delegateAppointment(req, res) {
  try {
    const { idCita } = req.params;
    const { nuevoDoctorId } = req.body;
    const result = await delegateAppointmentService(idCita, nuevoDoctorId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error delegateAppointment:", error);
    res.status(500).json({ error: "Ocurrió un error al delegar la cita. Intente nuevamente más tarde." });
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
