const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Crear un producto
router.post('/', productoController.crearProducto);

// Obtener todos los productos
router.get('/', productoController.obtenerProductos);

// Obtener un producto por su ID
router.get('/:id', productoController.obtenerProductoPorId);

// Actualizar un producto por su ID
router.put('/:id', productoController.actualizarProducto);

// Eliminar un producto por su ID
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;
