const Proveedor = require('../models/Proveedor');


// Crear proveedor
exports.crearProveedor = async (req, res) => {
    try {
        const nuevoProveedor = new Proveedor(req.body);
        await nuevoProveedor.save();
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear proveedor', detalle: error.message });
    }
};

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find();
        res.status(200).json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores', detalle: error.message });
    }
};

// Obtener proveedor por ID
exports.obtenerProveedorPorId = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json(proveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedor', detalle: error.message });
    }
};

// Actualizar proveedor
exports.actualizarProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json(proveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar proveedor', detalle: error.message });
    }
};

// Eliminar proveedor
exports.eliminarProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor', detalle: error.message });
    }
};
