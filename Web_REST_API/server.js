// server.js
const express = require('express');
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Inicializar Firebase
initializeFirebase();

// Middleware para parsear JSON
app.use(express.json());

// Importar las rutas desde src/api/routes
const doctorsRoutes = require('./src/api/routes/doctors.routes');
const appointmentsRoutes = require('./src/api/routes/appointments.routes');
const citasRoutes = require('./src/api/routes/citas.routes');
const patientsRoutes = require('./src/api/routes/patients.routes');
const usersRoutes = require('./src/api/routes/users.routes');

app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/usuarios', usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


const jwt = require('jsonwebtoken');

// Usamos un payload mínimo: solo un id o usuario corto.
const payload = { id: 'u1' };

// Clave secreta
const secret = 'MiClaveSecreta';

// Opciones: por ejemplo, expiración en 1 hora
const options = { expiresIn: '1h' };

// Genera el token
const token = jwt.sign(payload, secret, options);
console.log(token);
