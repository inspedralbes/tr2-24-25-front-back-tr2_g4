const mongoose = require('mongoose');

const ResultadoSchema = new mongoose.Schema({
  preguntaId: { type: Number, required: true },
  dificultad: { type: Number, required: true },
  esCorrecto: { type: Boolean, required: true },
  nombreAlumno: { type: String, required: true }, // Nuevo campo para el nombre del alumno
  tipoPregunta: { type: String, required: true },
  fecha: { type: Date, default: Date.now }, // Fecha de registro
});

module.exports = mongoose.model('Resultado', ResultadoSchema);
