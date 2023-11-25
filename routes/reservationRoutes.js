const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/', reservationController.createReservation);
// Puedes agregar rutas adicionales para gestionar reservas

module.exports = router;
