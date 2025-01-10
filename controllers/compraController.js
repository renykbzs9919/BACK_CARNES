const Compra = require('../models/Compra');
const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');

// Registrar compra
const registrarCompra = async (req, res) => {
    try {
        const { proveedorId, productos, fechaCompra, pago } = req.body;

        // Verificar que los valores necesarios estén presentes
        if (!proveedorId || !productos || !fechaCompra || pago === undefined) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        // Obtener proveedor para verificar existencia
        const proveedor = await Proveedor.findById(proveedorId);
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
        }

        let totalCompra = 0;
        let productosDetalle = [];

        // Calcular el total de la compra y verificar existencia de productos
        for (let item of productos) {
            const producto = await Producto.findById(item.productoId);
            if (!producto) {
                return res.status(404).json({ message: `Producto con ID ${item.productoId} no encontrado.` });
            }

            const subtotal = item.precio * item.cantidad;
            totalCompra += subtotal;

            productosDetalle.push({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precio: item.precio,
                subtotal: subtotal
            });
        }
        // Validar que el pago no sea menor a 0 ni mayor al total de la venta
        if (pago < 0) {
            return res.status(400).json({ message: "El pago no puede ser menor a 0." });
        }

        if (pago > totalCompra) {
            return res.status(400).json({ message: `El pago no puede ser mayor al total de la Compra. Total de la Compra: ${totalCompra}` });
        }

        // Si el pago es válido, ahora procedemos a actualizar el stock
        for (let item of productos) {
            const producto = await Producto.findById(item.productoId);
            producto.cantidadDisponible += item.cantidad;
            await producto.save();
        }

        // Crear la compra
        const nuevaCompra = new Compra({
            proveedorId,
            productos: productosDetalle,
            total: totalCompra,
            saldo: totalCompra - pago,
            fechaCompra: fechaCompra, // Asumiendo que fechaCompra es un string
            pagos: []  // Iniciar sin pagos, el pago se agregará si es mayor a 0
        });

        // Si el pago es mayor que 0, registrar el pago en el modelo
        if (pago > 0) {
            nuevaCompra.pagos.push({ monto: pago, fecha: fechaVenta });
        }

        // Actualizar monto pagado
        nuevaCompra.montoPagado = pago;

        // Actualizar estado
        if (nuevaCompra.saldo === 0) {
            nuevaCompra.estado = 'pagado';
        } else if (nuevaCompra.montoPagado > 0) {
            nuevaCompra.estado = 'parcial';
        }

        // Guardar la compra
        await nuevaCompra.save();

        res.status(201).json(nuevaCompra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Registrar pago para una compra
const registrarPago = async (req, res) => {
    try {
        const { proveedorId, compraId, montoPago, fechaPago } = req.body;

        // Validación de pago
        if (montoPago <= 0) {
            return res.status(400).json({ message: "El monto del pago debe ser mayor que 0." });
        }

        // Buscar el proveedor
        const proveedor = await Proveedor.findById(proveedorId);
        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
        }

        // Si se proporciona el ID de la compra
        if (compraId) {
            // Buscar la compra específica
            const compra = await Compra.findById(compraId);

            if (!compra) {
                return res.status(404).json({ message: 'Compra no encontrada.' });
            }

            if (compra.proveedorId.toString() !== proveedorId) {
                return res.status(400).json({ message: 'El proveedor de la compra no coincide con el proveedor del pago.' });
            }

            // Verificar si el saldo es suficiente
            if (montoPago > compra.saldo) {
                return res.status(400).json({ message: `El monto no puede superar el saldo de la compra. Saldo restante: ${compra.saldo}.` });
            }

            // Registrar el pago
            compra.pagos.push({ monto: montoPago, fecha: fechaPago }); // fechaPago es un string

            // Actualizar monto pagado y saldo
            compra.montoPagado += montoPago;
            compra.saldo = compra.total - compra.montoPagado;

            // Actualizar estado
            if (compra.saldo === 0) {
                compra.estado = 'pagado';
            } else if (compra.montoPagado > 0) {
                compra.estado = 'parcial';
            }

            // Guardar cambios
            await compra.save();

            return res.status(200).json(compra);
        } else {
            // Si no se proporciona el ID de la compra, pagamos a las compras más antiguas
            let montoRestante = montoPago;

            // Buscar todas las compras del proveedor con saldo pendiente, ordenadas por fecha
            const comprasPendientes = await Compra.find({ proveedorId, saldo: { $gt: 0 } }).sort({ fechaCompra: 1 });

            // Distribuir el pago entre las compras más antiguas
            for (let compra of comprasPendientes) {
                if (montoRestante <= 0) break;

                const saldoCompra = compra.saldo;

                // Si el monto restante cubre el saldo de la compra
                if (montoRestante >= saldoCompra) {
                    compra.pagos.push({ monto: saldoCompra, fecha: fechaPago }); // fechaPago es un string
                    compra.montoPagado += saldoCompra;
                    compra.saldo = 0;
                    compra.estado = 'pagado'; // Compra completamente saldada
                    montoRestante -= saldoCompra;
                } else {
                    // Si el monto restante no cubre el saldo de la compra
                    compra.pagos.push({ monto: montoRestante, fecha: fechaPago }); // fechaPago es un string
                    compra.montoPagado += montoRestante;
                    compra.saldo -= montoRestante;
                    montoRestante = 0;
                    compra.estado = 'parcial'; // Compra parcialmente pagada
                }

                // Guardar los cambios
                await compra.save();
            }

            if (montoRestante > 0) {
                return res.status(400).json({ message: `El monto restante de ${montoRestante} no pudo ser aplicado. Es posible que las compras ya estén saldadas o que no haya suficientes deudas pendientes.` });
            }

            return res.status(200).json({ message: 'Pago realizado con éxito.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las compras
const obtenerCompras = async (req, res) => {
    try {
        const compras = await Compra.find().populate('proveedorId productos.productoId');
        res.status(200).json(compras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener compra por ID
const obtenerCompraPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const compra = await Compra.findById(id).populate('productos.productoId').populate('proveedorId');

        if (!compra) {
            return res.status(404).json({ message: 'Compra no encontrada.' });
        }

        res.status(200).json(compra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la compra', detalle: error.message });
    }
};


module.exports = {
    registrarCompra,
    registrarPago,
    obtenerCompras,
    obtenerCompraPorId
};
