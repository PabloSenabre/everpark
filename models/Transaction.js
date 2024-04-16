const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monto: { type: Number, required: true },
  tipo: { type: String, required: true, enum: ['carga', 'pago', 'recompensa', 'retiro'] },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['completada', 'pendiente', 'fallida'], default: 'pendiente' },
  detalles: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
