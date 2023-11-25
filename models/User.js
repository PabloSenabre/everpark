const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String, // Considera usar hashing para la contraseña
  coche: {
    marca: String,
    modelo: String,
    color: String,
    matricula: String
  }
  // Agrega cualquier otro campo que consideres necesario
});

const User = mongoose.model('User', userSchema);

module.exports = User;
