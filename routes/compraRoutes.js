const express = require('express');
const { registrarCompra, registrarPago, obtenerCompras, obtenerCompraPorId } = require('../controllers/compraController');
const router = express.Router();

// Registrar una compra (con pago)
router.post('/', registrarCompra);

// Registrar un pago adicional
router.post('/pago', registrarPago);

// Obtener todas las compras
router.get('/', obtenerCompras);

// Obtener una compra por su ID
router.get('/:id', obtenerCompraPorId);

module.exports = router;
