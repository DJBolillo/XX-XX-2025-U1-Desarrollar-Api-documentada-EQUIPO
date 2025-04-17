// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Coloca tu archivo de credenciales aquí

function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://citas-dsw5.firebaseio.com'
    });
    console.log("Firebase inicializado correctamente");
  }
}

module.exports = { initializeFirebase, admin };
