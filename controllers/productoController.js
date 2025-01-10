const Producto = require('../models/Producto');
const Compra = require('../models/Compra');
const Venta = require('../models/Venta');

// Crear producto
exports.crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto', detalle: error.message });
    }
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
    }
};

// Obtener un producto por ID
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto', detalle: error.message });
    }
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
    try {
        // Filtrar solo el campo nombre para ser actualizado
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio para actualizar el producto.' });
        }

        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Actualizar solo el nombre del producto
        producto.nombre = nombre;

        // Guardar los cambios
        await producto.save();

        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message });
    }
};

// Eliminar producto
exports.eliminarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;

        // Verificar si el producto está en alguna compra
        const comprasRelacionadas = await Compra.find({ 'productos.productoId': productoId });
        if (comprasRelacionadas.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar el producto, ya está relacionado con una compra.' });
        }

        // Verificar si el producto está en alguna venta
        const ventasRelacionadas = await Venta.find({ 'productos.productoId': productoId });
        if (ventasRelacionadas.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar el producto, ya está relacionado con una venta.' });
        }

        // Eliminar el producto si no está relacionado con compras ni ventas
        const productoEliminado = await Producto.findByIdAndDelete(productoId);
        if (!productoEliminado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto', detalle: error.message });
    }
};