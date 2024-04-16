const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  nombre: { type: String, unique: false },
  apellido: { type: String, unique: false },
  email: { type: String, unique: true },
  password: String, // Considera usar hashing para la contraseña
  coche: {
    marca: String,
    modelo: String,
    color: String,
    matricula: String
  },
        saldo: { type: Number, default: 0 },
        historialTransacciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
  },
  // Agrega cualquier otro campo que consideres necesario
);

const User = mongoose.model('User', userSchema);

module.exports = User;
