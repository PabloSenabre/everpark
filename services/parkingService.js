const Parking = require('../models/Parking');

exports.buscarAparcamientosCercanos = async (longitud, latitud, maxDistancia) => {
  try {
    const aparcamientos = await Parking.find({
      ubicacion: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitud, latitud]
          },
          $maxDistance: maxDistancia
        }
      }
    });
    return aparcamientos;
  } catch (error) {
    throw new Error('Error al buscar aparcamientos: ' + error.message);
  }
};
