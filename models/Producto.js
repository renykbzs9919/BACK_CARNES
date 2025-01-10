// models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    cantidadDisponible: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model('Producto', productoSchema);
