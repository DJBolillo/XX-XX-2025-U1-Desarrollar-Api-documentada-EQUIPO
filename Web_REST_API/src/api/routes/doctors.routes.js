// src/api/routes/doctors.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getDoctorsList,
  addOneDoctor,
  updateDoctorData,
  giveDoctorVacations,
  getAppointmentById,
  deleteDoctor,
  getDoctorAvailability,
  getSpecialties
} = require('../controllers/doctors.controller');

router.get('/', authenticateToken, getDoctorsList);
router.get('/:idDoctor/appointments/:idCita', authenticateToken, getAppointmentById);
router.post('/newDoctor', authenticateToken, addOneDoctor);
router.patch('/:idDoctor', authenticateToken, updateDoctorData);
router.patch('/:idDoctor/vacation', authenticateToken, giveDoctorVacations);
router.get('/medicos/:id/disponibilidad', authenticateToken, getDoctorAvailability);
router.get('/especialidades', authenticateToken, getSpecialties);
router.delete('/:id', authenticateToken, deleteDoctor);

module.exports = router;
