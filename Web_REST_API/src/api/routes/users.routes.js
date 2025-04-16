// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();

const { updatePatientController } = require('../controllers/users.controller');

// PUT /api/usuarios/:id
router.put("/:id", updatePatientController);


module.exports = router;
