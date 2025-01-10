const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: String,
    direccion: String,
});

module.exports = mongoose.model('Cliente', clienteSchema);
