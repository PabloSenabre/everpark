const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ nombre, apellido, email, password: hashedPassword });
    await user.save();

    // Generar token
    const token = generateToken(user);

    res.status(201).json({ message: 'Usuario registrado con éxito', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user);

    res.status(200).json({ message: 'Inicio de sesión exitoso', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Actualización de perfil
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { nombre, apellido, email } = req.body;
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: 'Perfil actualizado con éxito', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
  }
};

// Función para cargar saldo al usuario
exports.cargarSaldo = async (req, res) => {
  try {
    const { userId, monto } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar saldo del usuario
    user.saldo += monto;
    await user.save();

    // Crear registro de transacción
    const transaccion = new Transaction({
      usuario: userId,
      monto: monto,
      tipo: 'carga',
      estado: 'completada'
    });
    await transaccion.save();

    res.status(200).json({ message: 'Saldo cargado con éxito', saldo: user.saldo });
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar saldo', error: error.message });
  }
};

// Función para realizar un pago
exports.realizarPago = async (req, res) => {
  try {
    const { userId, monto } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.saldo < monto) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    // Actualizar saldo del usuario
    user.saldo -= monto;
    await user.save();

    // Crear registro de transacción
    const transaccion = new Transaction({
      usuario: userId,
      monto: monto,
      tipo: 'pago',
      estado: 'completada'
    });
    await transaccion.save();

    res.status(200).json({ message: 'Pago realizado con éxito', saldo: user.saldo });
  } catch (error) {
    res.status(500).json({ message: 'Error al realizar el pago', error: error.message });
  }
};

// Función para acreditar una recompensa
exports.acreditarRecompensa = async (req, res) => {
  try {
    const { userId, monto } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar saldo del usuario
    user.saldo += monto;
    await user.save();

    // Crear registro de transacción
    const transaccion = new Transaction({
      usuario: userId,
      monto: monto,
      tipo: 'recompensa',
      estado: 'completada'
    });
    await transaccion.save();

    res.status(200).json({ message: 'Recompensa acreditada con éxito', saldo: user.saldo });
  } catch (error) {
    res.status(500).json({ message: 'Error al acreditar la recompensa', error: error.message });
  }
};

// Función para retirar saldo del usuario
exports.retirarSaldo = async (req, res) => {
  try {
    const { userId, monto } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.saldo < monto) {
      return res.status(400).json({ message: 'Saldo insuficiente para retiro' });
    }

    // Actualizar saldo del usuario
    user.saldo -= monto;
    await user.save();

    // Crear registro de transacción
    const transaccion = new Transaction({
      usuario: userId,
      monto: monto,
      tipo: 'retiro',
      estado: 'completada'
    });
    await transaccion.save();

    res.status(200).json({ message: 'Retiro de saldo realizado con éxito', saldo: user.saldo });
  } catch (error) {
    res.status(500).json({ message: 'Error al retirar saldo', error: error.message });
  }
};
