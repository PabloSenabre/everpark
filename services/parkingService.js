const Parking = require('../models/Parking');

exports.buscarAparcamientosCercanos = async (longitud, latitud, maxDistancia) => {
  try {
    console.log(`Buscando aparcamientos cercanos a [${longitud}, ${latitud}] con maxDistancia ${maxDistancia}`);
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
    console.log(`Aparcamientos encontrados: ${aparcamientos.length}`);
    return aparcamientos;
  } catch (error) {
    throw new Error('Error al buscar aparcamientos: ' + error.message);
  }
};
