require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cron = require('node-cron');
const pendingSearchController = require('./controllers/pendingSearchController');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const port = process.env.PORT || 3000; // Usa la variable de entorno PORT o 3000 si no está definida

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/', (req, res) => {
  res.send('Prueba de servidor Express');
});

cron.schedule('*/30 * * * * *', () => {
  console.log('Revisando búsquedas pendientes...');
  pendingSearchController.revisarBusquedasPendientes();
});

// Replace '<your-connection-string>' with your actual MongoDB Atlas connection string from the .env file
const dbURI = process.env.MONGO_URI || '<your-connection-string>';

// Connect to MongoDB using the connection string
mongoose.connect(dbURI)
  .then(() => {
    console.log("Conectado exitosamente a la base de datos de MongoDB Atlas");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    // It might be a good idea to exit the process if there's a database connection error
    process.exit(1);
  });

