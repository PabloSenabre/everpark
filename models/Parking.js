const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ubicacion: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number], // Formato [longitud, latitud]
      required: true
    }
  },
  horaInicio: { // Nuevo campo para la hora de inicio
    type: Date,
    required: true
  },
  horaSalida: {
    type: Date,
    required: true
  },
  detallesVehiculo: {
    marca: String,
    modelo: String,
    color: String,
    matriculaParcial: String
  },
  // otros campos según sea necesario
});

// Crear un índice geoespacial para la ubicación
parkingSchema.index({ ubicacion: '2dsphere' });

const Parking = mongoose.model('Parking', parkingSchema);

module.exports = Parking;



