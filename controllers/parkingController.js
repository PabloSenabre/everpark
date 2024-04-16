const Parking = require('../models/Parking');
const moment = require('moment');

exports.createParking = async (req, res) => {
  try {
    const { ubicacionCoords, usuario, tipoOferta, horaSalida } = req.body;
    let detallesVehiculo = req.body.detallesVehiculo || {};
    let horaInicio, horaSalidaCalculada;

    // Asegúrate de que detallesVehiculo tenga una estructura adecuada, incluso si algunos campos no se proporcionan
    detallesVehiculo = {
      marca: detallesVehiculo.marca || '',
      modelo: detallesVehiculo.modelo || '',
      color: detallesVehiculo.color || '',
      matriculaParcial: detallesVehiculo.matriculaParcial || '', // Hace que la matrícula sea opcional
    };

    if (tipoOferta === 'inmediata') {
      horaInicio = new Date();
      horaSalidaCalculada = moment(horaInicio).add(10, 'minutes').toISOString();
    } else {
      horaInicio = new Date();
      horaSalidaCalculada = horaSalida;
    }

    const parking = new Parking({ 
      ubicacion: { type: 'Point', coordinates: ubicacionCoords },
      usuario,
      horaInicio,
      horaSalida: horaSalidaCalculada,
      detallesVehiculo
    });

    await parking.save();
    res.status(201).json({ message: 'Aparcamiento creado con éxito', parking });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el aparcamiento', error: error.message });
  }
};



// Función para obtener aparcamientos con filtros de ubicación y hora
exports.getParkings = async (req, res) => {
  try {
    // Obtener parámetros de filtro desde la solicitud, si existen
    const { longitud, latitud, maxDistancia, horaInicio, horaFin } = req.query;

    // Crear un objeto de filtro basado en los parámetros proporcionados
    let filtros = {};
    if (longitud && latitud) {
      filtros.ubicacion = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitud), parseFloat(latitud)]
          },
          $maxDistance: maxDistancia ? parseInt(maxDistancia) : 5000 // 5km por defecto
        }
      };
    }
    if (horaInicio && horaFin) {
      filtros.horaSalida = {
        $gte: new Date(horaInicio),
        $lte: new Date(horaFin)
      };
    }

    const parkings = await Parking.find(filtros);
    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los aparcamientos', error: error.message });
  }
};
