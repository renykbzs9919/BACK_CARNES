const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// Crear un proveedor
router.post('/', proveedorController.crearProveedor);

// Obtener todos los proveedores
router.get('/', proveedorController.obtenerProveedores);

// Obtener un proveedor por su ID
router.get('/:id', proveedorController.obtenerProveedorPorId);

// Actualizar un proveedor por su ID
router.put('/:id', proveedorController.actualizarProveedor);

// Eliminar un proveedor por su ID
router.delete('/:id', proveedorController.eliminarProveedor);

module.exports = router;
