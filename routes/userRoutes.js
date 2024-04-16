const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta de registro
router.post('/register', userController.register);

// Ruta de login
router.post('/login', userController.login);

// Ruta para actualizar perfil de usuario
router.put('/update/:userId', userController.updateProfile);

// Rutas para la gestión de saldo
router.post('/cargarSaldo', userController.cargarSaldo);
router.post('/realizarPago', userController.realizarPago);
router.post('/acreditarRecompensa', userController.acreditarRecompensa);
router.post('/retirarSaldo', userController.retirarSaldo);

module.exports = router;

