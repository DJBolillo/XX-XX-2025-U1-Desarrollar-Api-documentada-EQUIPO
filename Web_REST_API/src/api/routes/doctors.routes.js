// src/api/routes/doctors.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  deleteDoctor
} = require('../controllers/doctors.controller');


// Eliminar un doctor MIO
router.delete('/:id', authenticateToken, deleteDoctor);



module.exports = router;
