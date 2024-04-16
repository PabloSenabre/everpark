require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cron = require('node-cron');
const pendingSearchController = require('./controllers/pendingSearchController');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const parkingRoutes = require('./routes/parkingRoutes'); // Asegúrate de tener la ruta correcta
const reservationRoutes = require('./routes/reservationRoutes'); // Asegúrate de tener la ruta correcta

// Conectar a la base de datos
require('./database.js'); // Asumiendo que database.js está en la misma carpeta que server.js

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/parkings', parkingRoutes); // Integración de rutas de aparcamientos
app.use('/api/reservations', reservationRoutes); // Integración de rutas de reservas

app.get('/', (req, res) => {
  res.send('Prueba de servidor Express');
});

cron.schedule('*/30 * * * * *', () => {
  console.log('Revisando búsquedas pendientes...');
  pendingSearchController.revisarBusquedasPendientes();
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});


