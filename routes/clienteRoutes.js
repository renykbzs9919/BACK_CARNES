const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Crear un cliente
router.post('/', clienteController.crearCliente);

// Obtener todos los clientes
router.get('/', clienteController.obtenerClientes);

// Obtener un cliente por su ID
router.get('/:id', clienteController.obtenerClientePorId);

// Actualizar un cliente por su ID
router.put('/:id', clienteController.actualizarCliente);

// Eliminar un cliente por su ID
router.delete('/:id', clienteController.eliminarCliente);

module.exports = router;
