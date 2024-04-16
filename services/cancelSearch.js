const mongoose = require('mongoose');
const PendingSearch = require('../models/PendingSearch'); // Asegúrate de que la ruta sea correcta
const { tareaCron } = require('../controllers/pendingSearchController'); // Asegúrate de que la ruta sea correcta

mongoose.connect('mongodb://localhost:27017/everpark_database', { useNewUrlParser: true, useUnifiedTopology: true });

const searchId = process.argv[2]; // Obtiene el ID de la búsqueda desde la línea de comandos

const cancelSearch = async () => {
  try {
    if (searchId) {
      // Cancela una búsqueda específica
      await PendingSearch.findByIdAndUpdate(searchId, { estado: 'cancelado' });
      console.log(`Búsqueda ${searchId} cancelada.`);
    } else {
      // Cancela todas las búsquedas pendientes
      await PendingSearch.updateMany({ estado: 'pendiente' }, { estado: 'cancelado' });
      console.log('Todas las búsquedas pendientes han sido canceladas.');

    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

cancelSearch();


// Para cancelar: node services/cancelSearch.js <searchId>
// Para cancelar todas las búsquedas pendientes: node services/cancelSearch.js