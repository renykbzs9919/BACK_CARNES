const express = require('express');
const { obtenerReporteInventario } = require('../controllers/inventarioController');

const router = express.Router();

router.get('/reporte-inventario', obtenerReporteInventario);

module.exports = router;
