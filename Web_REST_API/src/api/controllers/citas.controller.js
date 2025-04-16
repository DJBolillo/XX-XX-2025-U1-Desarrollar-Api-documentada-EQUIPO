// controllers/citas.controller.js
const {


  eliminarCitaService,
  cambiarMedico,
  confirmarAsistencia
} = require('../services/citas.service');





// Elimina una cita
const eliminarCita = async (req, res) => {
  const idCita = req.params.id;

  try {
    const mensaje = await eliminarCitaService(idCita);
    return res.status(200).json({ mensaje });
  } catch (error) {
    const { code, message } = error;
    return res.status(code || 500).json({ error: message || 'Error interno del servidor' });
  }
};

//endpoitn 16
async function solicitarCambioMedico(req, res) {
  const citaId = req.params.id;
  const { nuevoMedicoId, motivo } = req.body;

  try {
    const resultado = await cambiarMedico(citaId, nuevoMedicoId, motivo);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en solicitarCambioMedico:', error);

    if (error.code === 404) {
      res.status(404).json({ error: error.message });
    } else if (error.code === 505) {
      res.status(505).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error.message || 'Error interno del servidor',
        detalle: error.stack,
      });
    }
  }
}

async function confirmarCita(req, res) {
  const idPaciente = req.params.idPaciente;
  const idCita = req.params.idCita;
  const { confirmada } = req.body;

  if (confirmada === undefined) {
    return res.status(400).json({ message: "El campo 'confirmada' es obligatorio" });
  }

  try {
    const resultado = await confirmarAsistencia(idPaciente, idCita, confirmada);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en confirmarCita:", error);

    if (error.code === 400) {
      res.status(400).json({ message: error.message });
    } else if (error.code === 404) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ error: "Ocurrió un error al actualizar la confirmación de la cita" });
    }
  }
}



module.exports = {
  eliminarCita,
  solicitarCambioMedico,
  confirmarCita,
};
