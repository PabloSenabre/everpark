const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const pendingSearchController = require('../controllers/pendingSearchController');

router.post('/', reservationController.createReservation);
// Puedes agregar rutas adicionales para gestionar reservas
router.patch('/cancel-search/:searchId', pendingSearchController.cancelarBusqueda);


module.exports = router;
