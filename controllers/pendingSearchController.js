// //Descripción General del Código para una Aplicación de Búsqueda y Reserva de Aparcamientos
// Este código pertenece a un sistema backend desarrollado para una aplicación de búsqueda y reserva de aparcamientos. La aplicación permite a los usuarios buscar aparcamientos disponibles en tiempo real y realizar reservas. El backend gestiona la lógica de negocios, la interacción con la base de datos y las respuestas a las solicitudes del cliente.

// Módulos Principales y sus Funciones
// parkingController.js:

// Maneja la creación de registros de aparcamiento y proporciona la funcionalidad para buscar aparcamientos disponibles basados en la ubicación y otros criterios.
// reservationController.js:

// Responsable de procesar las solicitudes de reserva de aparcamiento. Comprueba la disponibilidad y asigna aparcamientos a los usuarios.
// userController.js:

// Gestiona las operaciones relacionadas con los usuarios, incluyendo registro, autenticación y manejo de perfiles.
// pendingSearchController.js:

// Se encarga de las búsquedas de aparcamientos que no han sido satisfechas inmediatamente. Revisa periódicamente las búsquedas pendientes y actualiza su estado.
// Modelos de MongoDB (User.js, Parking.js, Reservation.js, PendingSearch.js):

// Define la estructura de datos para usuarios, aparcamientos, reservas y búsquedas pendientes.
// parkingService.js:

// Proporciona servicios para buscar aparcamientos, utilizando consultas geoespaciales para encontrar aparcamientos cercanos.
// Rutas de Express (ParkingRoutes.js, ReservationRoutes.js, UserRoutes.js):

// Define las rutas y endpoints de la API para manejar las solicitudes de aparcamiento, reservas y operaciones de usuarios.
// Servidor Express (server.js):

// Configura y lanza el servidor Express, conecta con la base de datos y establece las rutas de la API.
// Características Especiales
// Cancelación Automática de Búsquedas: pendingSearchController.js incluye una funcionalidad para cancelar automáticamente búsquedas de aparcamiento después de 10 minutos si no se encuentra un match.
// Tarea Cron: Se utiliza una tarea cron para revisar regularmente las búsquedas pendientes y actualizar su estado.
// Seguridad y Autenticación: El sistema utiliza tokens JWT para la autenticación de usuarios.
// Contexto de Uso
// Este código es utilizado por una aplicación de reserva de aparcamientos que requiere manejar datos en tiempo real, gestionar la disponibilidad de aparcamientos y proporcionar una interfaz fluida y segura para los usuarios.

// Cancelación Automática de Búsquedas: pendingSearchController.js incluye una funcionalidad para cancelar automáticamente búsquedas de aparcamiento después de 10 minutos si no se encuentra un match.
// Tarea Cron: Se utiliza una tarea cron para revisar regularmente las búsquedas pendientes y actualizar su estado.
// Seguridad y Autenticación: El sistema utiliza tokens JWT para la autenticación de usuarios.
// Contexto de Uso
// Este código es utilizado por una aplicación de reserva de aparcamientos que requiere manejar datos en tiempo real, gestionar la disponibilidad de aparcamientos y proporcionar una interfaz fluida y segura para los usuarios.

const PendingSearch = require('../models/PendingSearch');
const parkingService = require('../services/parkingService');
const cron = require('node-cron');
const moment = require('moment'); // Requiere tener 'moment' instalado para manejar fechas
const events = require('events'); // Para emitir y manejar eventos
const eventEmitter = new events.EventEmitter(); // Crea un emisor de eventos


// Función para registrar una búsqueda pendiente
exports.registrarBusquedaPendiente = async (datosBusqueda) => {
  try {
    const nuevaBusqueda = new PendingSearch({
      ...datosBusqueda,
      horaInicioBusqueda: new Date() // Registra la hora de inicio de la búsqueda
    });
    await nuevaBusqueda.save();
  } catch (error) {
    console.error('Error al registrar búsqueda pendiente: ' + error.message);
    eventEmitter.emit('error', error); // Emitir evento de error
  }
};

// Función para revisar y actualizar búsquedas pendientes
exports.revisarBusquedasPendientes = async () => {
  try {
    const busquedasPendientes = await PendingSearch.find({ 
      estado: 'pendiente', 
      horaInicioBusqueda: { $lt: new Date(Date.now() - 10 * 60 * 1000) } // Búsquedas mayores a 10 minutos
    });
    const tiempoActual = moment();

    for (let busqueda of busquedasPendientes) {
      const tiempoInicioBusqueda = moment(busqueda.horaInicioBusqueda);
      const diferenciaMinutos = tiempoActual.diff(tiempoInicioBusqueda, 'minutes');

      if (diferenciaMinutos >= 10) {
        await PendingSearch.findByIdAndUpdate(busqueda._id, { estado: 'cancelado' });
      } else {
        const aparcamientosDisponibles = await parkingService.buscarAparcamientosCercanos(
          busqueda.ubicacion.coordinates[0],
          busqueda.ubicacion.coordinates[1],
          5000
        );
        const aparcamientoSeleccionado = parkingService.seleccionarMejorAparcamiento(aparcamientosDisponibles, busqueda.horaBusqueda);
        if (aparcamientoSeleccionado) {
          await PendingSearch.findByIdAndUpdate(busqueda._id, { estado: 'encontrado', aparcamiento: aparcamientoSeleccionado._id });
          // Aquí puedes implementar la lógica de notificación al usuario
        }
      }
    }
  } catch (error) {
    console.error('Error al revisar búsquedas pendientes: ' + error.message);
    eventEmitter.emit('error', error); // Emitir evento de error
  }
};

// Tarea programada con cron para revisar las búsquedas pendientes cada 30 segundos
exports.tareaCron = cron.schedule('*/30 * * * * * ', () => {
  exports.revisarBusquedasPendientes();
}, {
  scheduled: false
});

// Inicia la tarea cron
exports.tareaCron.start();

exports.cancelarBusqueda = async (req, res) => {
  try {
      const { searchId } = req.params;
      const busqueda = await PendingSearch.findById(searchId);

      if (!busqueda) {
          return res.status(404).send('Búsqueda no encontrada');
      }

      busqueda.estado = 'cancelado';
      await busqueda.save();
      
      res.status(200).send('Búsqueda cancelada con éxito');
  } catch (error) {
      console.error('Error al cancelar búsqueda: ' + error.message);
      res.status(500).send('Error al cancelar búsqueda');
      eventEmitter.emit('error', error); // Emitir evento de error
  }
};



