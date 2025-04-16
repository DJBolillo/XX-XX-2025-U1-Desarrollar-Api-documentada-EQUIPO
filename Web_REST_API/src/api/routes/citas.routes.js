// src/api/routes/citas.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  eliminarCita,
  solicitarCambioMedico,
  confirmarCita,
} = require('../controllers/citas.controller');


// DELETE /api/citas/:id
router.delete('/:id', eliminarCita);

// PATCH /api/citas/:id/cambiar-medico
router.patch('/:id/cambiar-medico', solicitarCambioMedico);
//confirmar asistencia
router.patch('/:idPaciente/appointments/:idCita/confirm', confirmarCita);



module.exports = router;
