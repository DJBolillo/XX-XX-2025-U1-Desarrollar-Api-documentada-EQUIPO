// src/api/routes/citas.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  changeDoctorRequest,
  deleteAppointment
} = require('../controllers/citas.controller');

// PATCH /api/citas/:id/cambiar-medico
router.patch('/:id/cambiar-medico', authenticateToken, changeDoctorRequest);

// DELETE /api/citas/:id
router.delete('/:id', authenticateToken, deleteAppointment);

module.exports = router;
