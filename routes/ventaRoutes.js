const express = require('express');
const { registrarVenta, registrarPago, obtenerVentas, obtenerVentaPorId } = require('../controllers/ventaController');
const router = express.Router();

// Registrar una compra (con pago)
router.post('/', registrarVenta);

// Registrar un pago adicional
router.post('/pago', registrarPago);

// Obtener todas las compras
router.get('/', obtenerVentas);

// Obtener una compra por su ID
router.get('/:id', obtenerVentaPorId);

module.exports = router;
