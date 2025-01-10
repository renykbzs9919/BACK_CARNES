const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

// Registrar venta
// Registrar venta
const registrarVenta = async (req, res) => {
    try {
        const { clienteId, productos, fechaVenta, pago } = req.body;

        // Verificar que los valores necesarios estén presentes
        if (!clienteId || !productos || !fechaVenta || pago === undefined) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        // Verificar que el cliente exista
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        // Calcular el total de la venta y verificar existencia de productos
        let totalVenta = 0;
        let productosDetalle = [];

        for (let item of productos) {
            const producto = await Producto.findById(item.productoId);
            if (!producto) {
                return res.status(404).json({ message: `Producto con ID ${item.productoId} no encontrado.` });
            }

            const subtotal = item.precio * item.cantidad;
            totalVenta += subtotal;

            // Verificar que hay suficiente stock
            if (producto.cantidadDisponible < item.cantidad) {
                return res.status(400).json({ message: `No hay suficiente stock del producto ${producto.nombre}.` });
            }

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

        if (pago > totalVenta) {
            return res.status(400).json({ message: `El pago no puede ser mayor al total de la venta. Total de la venta: ${totalVenta}` });
        }

        // Si el pago es válido, ahora procedemos a actualizar el stock
        for (let item of productos) {
            const producto = await Producto.findById(item.productoId);
            producto.cantidadDisponible -= item.cantidad;
            await producto.save();
        }

        // Crear la venta
        const nuevaVenta = new Venta({
            clienteId,
            productos: productosDetalle,
            total: totalVenta,
            saldo: totalVenta - pago,
            fechaVenta,  // La fecha se maneja como string
            pagos: []  // Iniciar sin pagos, el pago se agregará si es mayor a 0
        });

        // Si el pago es mayor que 0, registrar el pago en el modelo
        if (pago > 0) {
            nuevaVenta.pagos.push({ monto: pago, fecha: fechaVenta });
        }

        // Actualizar monto pagado
        nuevaVenta.montoPagado = pago;

        // Actualizar estado de la venta
        if (nuevaVenta.saldo === 0) {
            nuevaVenta.estado = 'pagado';
        } else if (nuevaVenta.montoPagado > 0) {
            nuevaVenta.estado = 'parcial';
        }

        // Guardar la venta
        await nuevaVenta.save();

        res.status(201).json(nuevaVenta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



// Registrar pago para una venta
const registrarPago = async (req, res) => {
    try {
        const { clienteId, ventaId, montoPago, fechaPago } = req.body;

        // Validación de pago
        if (montoPago <= 0) {
            return res.status(400).json({ message: "El monto del pago debe ser mayor que 0." });
        }

        // Verificar que el cliente exista
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        if (ventaId) {
            // Buscar la venta por ID
            const venta = await Venta.findById(ventaId);
            if (!venta) {
                return res.status(404).json({ message: 'Venta no encontrada.' });
            }

            // Verificar si el saldo es suficiente
            if (venta.saldo < montoPago) {
                return res.status(400).json({ message: `El monto a pagar excede el saldo pendiente de la venta. Saldo disponible: ${venta.saldo}` });
            }

            // Registrar pago
            venta.pagos.push({ monto: montoPago, fecha: fechaPago });  // fechaPago es un string
            venta.saldo -= montoPago;

            // Actualizar estado de la venta
            if (venta.saldo === 0) {
                venta.estado = 'pagado';
            } else {
                venta.estado = 'parcial';
            }

            // Guardar la venta con el nuevo pago
            await venta.save();

            return res.status(200).json(venta);
        } else {
            // Si no se proporciona `ventaId`, aplicar el pago a las ventas más antiguas
            let pagosRestantes = montoPago;

            // Obtener todas las ventas pendientes del cliente, ordenadas por fecha (más antigua primero)
            const ventas = await Venta.find({ clienteId, estado: 'pendiente' }).sort({ fechaVenta: 1 });

            for (let venta of ventas) {
                if (pagosRestantes <= 0) break;

                const pagoDisponible = Math.min(pagosRestantes, venta.saldo);

                // Registrar el pago
                venta.pagos.push({ monto: pagoDisponible, fecha: fechaPago });  // fechaPago como string
                venta.saldo -= pagoDisponible;

                // Actualizar estado
                if (venta.saldo === 0) {
                    venta.estado = 'pagado';
                } else {
                    venta.estado = 'parcial';
                }

                // Guardar los cambios
                await venta.save();

                pagosRestantes -= pagoDisponible;
            }

            if (pagosRestantes > 0) {
                return res.status(400).json({ message: `El monto restante de ${pagosRestantes} no pudo ser aplicado.` });
            }

            return res.status(200).json({ message: 'Pago realizado con éxito.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las ventas
const obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.find().populate('clienteId productos.productoId');
        res.status(200).json(ventas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener venta por ID
const obtenerVentaPorId = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id).populate('clienteId').populate('productos.productoId');
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la venta', detalle: error.message });
    }
};


module.exports = {
    registrarVenta,
    registrarPago,
    obtenerVentas,
    obtenerVentaPorId
};
