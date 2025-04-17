// config/firebase.js
const admin = require('firebase-admin');

function initializeFirebase() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://citas-dsw5.firebaseio.com'
    });

    console.log("Firebase inicializado correctamente");
  }
}

module.exports = { initializeFirebase, admin };

