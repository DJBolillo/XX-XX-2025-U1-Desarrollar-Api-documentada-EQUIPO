// src/api/routes/patients.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  sendAppointmentReminder,
  confirmAppointmentStatus
} = require('../controllers/patients.controller');

// POST /api/patients/:idPaciente/appointments/:idCita/reminder
router.post('/:idPaciente/appointments/:idCita/reminder', authenticateToken, sendAppointmentReminder);

// PATCH /api/patients/:idPaciente/appointments/:idCita/confirm
router.patch('/:idPaciente/appointments/:idCita/confirm', authenticateToken, confirmAppointmentStatus);

module.exports = router;
