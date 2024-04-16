require('dotenv').config(); // Ensure you have the dotenv package installed and the .env file set up
const mongoose = require('mongoose');

// Replace '<your-connection-string>' with your actual MongoDB Atlas connection string from the .env file
const dbURI = process.env.MONGO_URI || '<your-connection-string>';

// Connect to MongoDB using the connection string
mongoose.connect(dbURI)
  .then(() => {
    console.log("Conectado exitosamente a la base de datos de MongoDB Atlas");
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
  });

// The connection object is not needed unless you want to listen to specific events




