// src/api/routes/appointments.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getAppointmentsToday,
  getAppointmentsHistory,
  getAppointmentsByDate,
  getAppointmentsByPatient,
  getAppointmentsByPatientName,
  addOneAppointment,
  delegateAppointment
} = require('../controllers/appointments.controller');

// GET /api/appointments/:doctorId/today
router.get('/:doctorId/today', authenticateToken, getAppointmentsToday);

// GET /api/appointments/:doctorId/history
router.get('/:doctorId/history', authenticateToken, getAppointmentsHistory);

// GET /api/appointments/:doctorId/patient/:patientId
router.get('/:doctorId/patient/:patientId', authenticateToken, getAppointmentsByPatient);

// GET /api/appointments/:doctorId/:date  (YYYY-MM-DD)
router.get('/:doctorId/:date', authenticateToken, getAppointmentsByDate);

// GET /api/appointments?patientName=Nombre
router.get('/', authenticateToken, getAppointmentsByPatientName);

// POST /api/appointments/
router.post('/', authenticateToken, addOneAppointment);

router.patch('/:idCita/delegate', authenticateToken, delegateAppointment);



module.exports = router;
