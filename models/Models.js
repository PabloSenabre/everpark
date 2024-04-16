const mongoose = require('mongoose');

// Importa los modelos de Aparcamiento y Reserva
const Parking = require('./Parking');
const Reservation = require('./Reservation');

// Define el modelo de Usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // Otros campos de usuario
});

const User = mongoose.model('User', userSchema);

module.exports = { User, Parking, Reservation };
