const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/', parkingController.createParking);
router.get('/', parkingController.getParkings);

module.exports = router;
