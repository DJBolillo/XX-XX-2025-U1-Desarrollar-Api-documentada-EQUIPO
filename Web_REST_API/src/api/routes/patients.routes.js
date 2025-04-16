// src/api/routes/patients.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  confirmAppointmentStatus
} = require('../controllers/patients.controller');

// PATCH /api/patients/:idPaciente/appointments/:idCita/confirm
router.patch('/patients/:idPaciente/appointments/:idCita/confirm', authenticateToken, confirmAppointmentStatus);

module.exports = router;
