const Parking = require('../models/Parking');

// Función para crear un nuevo aparcamiento
exports.createParking = async (req, res) => {
  try {
    const { ubicacionCoords, horaSalida, detallesVehiculo, usuario } = req.body;
    const parking = new Parking({ 
      ubicacion: {
        type: 'Point',
        coordinates: ubicacionCoords // Espera un arreglo [longitud, latitud]
      },
      horaSalida, 
      detallesVehiculo, 
      usuario 
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


