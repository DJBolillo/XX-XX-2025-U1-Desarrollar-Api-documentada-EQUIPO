// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { updateUser } = require('../controllers/users.controller');

// PUT /api/usuarios/:id
router.put('/:id', authenticateToken, updateUser);

module.exports = router;
