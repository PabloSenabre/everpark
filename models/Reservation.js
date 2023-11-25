const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  usuarioBuscando: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking',
    required: true
  },
  horaReserva: Date,
  estado: String, // Ejemplo: 'pendiente', 'confirmado', 'cancelado'
  detallesMatch: {
    marca: String,
    modelo: String,
    color: String,
    matriculaParcial: String // Detalles del vehículo del usuario que libera el espacio
  },
  // Agrega otros campos necesarios
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

