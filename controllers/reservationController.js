const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');
const parkingService = require('../services/parkingService');

// Función para seleccionar el mejor aparcamiento
function seleccionarMejorAparcamiento(aparcamientos, horaReserva) {
    // Filtrar aparcamientos que estarán disponibles cerca de la hora de reserva
    const aparcamientosFiltrados = aparcamientos.filter(parking => {
        const horaSalida = new Date(parking.horaSalida);
        const diferenciaHora = Math.abs(horaSalida - new Date(horaReserva));
        return diferenciaHora <= 30 * 60 * 1000; // 30 minutos en milisegundos
    });

    // Ordenar por proximidad de la hora de salida a la hora de reserva
    aparcamientosFiltrados.sort((a, b) => {
        const diferenciaHoraA = Math.abs(new Date(a.horaSalida) - new Date(horaReserva));
        const diferenciaHoraB = Math.abs(new Date(b.horaSalida) - new Date(horaReserva));
        return diferenciaHoraA - diferenciaHoraB;
    });

    // Devolver el aparcamiento más cercano o null si no hay ninguno
    return aparcamientosFiltrados.length > 0 ? aparcamientosFiltrados[0] : null;
}

exports.createReservation = async (req, res) => {
  try {
    const { usuarioBuscando, horaReserva, modoBusqueda, ubicacionUsuario } = req.body;

    // Buscar aparcamientos cercanos
    const aparcamientosCercanos = await parkingService.buscarAparcamientosCercanos(
      ubicacionUsuario.longitud, 
      ubicacionUsuario.latitud, 
      5000 // Radio de búsqueda en metros
    );

    // Seleccionar el mejor aparcamiento
    const aparcamientoSeleccionado = seleccionarMejorAparcamiento(aparcamientosCercanos, horaReserva);

    if (!aparcamientoSeleccionado) {
      return res.status(404).json({ message: 'No se encontraron aparcamientos disponibles' });
    }

    // Crear la reserva
    const reservation = new Reservation({ 
      usuarioBuscando, 
      parking: aparcamientoSeleccionado._id, 
      horaReserva, 
      estado: 'pendiente' 
    });
    await reservation.save();

    res.status(201).json({ message: 'Reserva creada con éxito', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
  }
};


