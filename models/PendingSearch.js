const mongoose = require('mongoose');

const pendingSearchSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ubicacion: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  horaBusqueda: { type: Date, required: true },
  horaInicioBusqueda: { type: Date, default: Date.now }, // Nuevo campo para registrar la hora de inicio
  estado: { type: String, enum: ['pendiente', 'encontrado', 'cancelado'], default: 'pendiente' },
  // Agrega otros campos según sea necesario
});

pendingSearchSchema.index({ ubicacion: '2dsphere' });

const PendingSearch = mongoose.model('PendingSearch', pendingSearchSchema);

module.exports = PendingSearch;
// Path: services/parkingService.js
