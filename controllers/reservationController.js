const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');
const parkingService = require('../services/parkingService');
const PendingSearch = require('../models/PendingSearch'); 
const moment = require('moment');

// Función para seleccionar el mejor aparcamiento
function seleccionarMejorAparcamiento(aparcamientos, horaReserva, modoBusqueda) {
  console.log(`Seleccionando mejor aparcamiento de entre ${aparcamientos.length} opciones`);

  // Filtrar aparcamientos que estarán disponibles cerca de la hora de reserva
  const aparcamientosFiltrados = aparcamientos.filter(parking => {
    const horaSalida = new Date(parking.horaSalida);
    const diferenciaHora = Math.abs(horaSalida - horaReserva);

    if (modoBusqueda === 'inmediata') {
      return diferenciaHora <= 10 * 60 * 1000; // 10 minutos en milisegundos
    } else {
      return diferenciaHora <= 5 * 60 * 1000; // 5 minutos en milisegundos para reservas programadas
    }
  });

  console.log(`Aparcamientos disponibles tras filtro de tiempo: ${aparcamientosFiltrados.length}`);

  // Ordenar por proximidad de la hora de salida a la hora de reserva
  aparcamientosFiltrados.sort((a, b) => {
    const diferenciaHoraA = Math.abs(new Date(a.horaSalida) - horaReserva);
    const diferenciaHoraB = Math.abs(new Date(b.horaSalida) - horaReserva);
    return diferenciaHoraA - diferenciaHoraB;
  });

  console.log(`Aparcamiento seleccionado: ${aparcamientosFiltrados.length > 0 ? aparcamientosFiltrados[0]._id : 'Ninguno'}`);
  
  // Devolver el aparcamiento más cercano o null si no hay ninguno
  return aparcamientosFiltrados.length > 0 ? aparcamientosFiltrados[0] : null;
}

exports.createReservation = async (req, res) => {
  try {
    const { usuarioBuscando, modoBusqueda, ubicacionUsuario, horaReservaProgramada } = req.body;
    let horaReserva;

    if (modoBusqueda === 'inmediata') {
      horaReserva = new Date(); // Establecer horaReserva a la hora actual
    } else {
      horaReserva = new Date(horaReservaProgramada); // Usar la hora proporcionada para búsquedas programadas
    }

    console.log(`Creando reserva para usuario ${usuarioBuscando} con modo de búsqueda ${modoBusqueda}`);

    // Buscar aparcamientos cercanos
    const aparcamientosCercanos = await parkingService.buscarAparcamientosCercanos(ubicacionUsuario.longitud, ubicacionUsuario.latitud, 5000);

    // Seleccionar el mejor aparcamiento
    const aparcamientoSeleccionado = seleccionarMejorAparcamiento(aparcamientosCercanos, horaReserva, modoBusqueda);

    if (!aparcamientoSeleccionado) {
      const nuevaBusquedaPendiente = new PendingSearch({
        usuario: usuarioBuscando,
        ubicacion: { type: 'Point', coordinates: [ubicacionUsuario.longitud, ubicacionUsuario.latitud] },
        horaBusqueda: horaReserva,
        estado: 'pendiente'
      });
      await nuevaBusquedaPendiente.save();
      return res.status(200).json({ message: 'Búsqueda pendiente registrada', busqueda: nuevaBusquedaPendiente });
    }

    // Crear la reserva
    const reservation = new Reservation({
      usuarioBuscando,
      parking: aparcamientoSeleccionado._id,
      horaReserva,
      estado: 'confirmado'
    });
    await reservation.save();

    res.status(201).json({ message: 'Reserva creada con éxito', reservation });
  } catch (error) {
    console.error('Error al crear la reserva: ' + error.message);
    res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
  }
};
