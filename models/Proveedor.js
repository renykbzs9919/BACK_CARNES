const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: String,
  direccion: String,
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
