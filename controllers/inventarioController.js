const Compra = require('../models/Compra');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// Reporte de inventario con fechas en formato string
const obtenerReporteInventario = async (req, res) => {
    try {
        const { dia, mes, anio } = req.query;

        // Obtener la fecha actual si no se envían filtros
        const fechaActual = new Date();
        const filtroDia = dia ? parseInt(dia, 10) : fechaActual.getDate();
        const filtroMes = mes ? parseInt(mes, 10) : fechaActual.getMonth() + 1;
        const filtroAnio = anio ? parseInt(anio, 10) : fechaActual.getFullYear();

        // Construir los filtros de fecha en formato string (YYYY-MM-DD)
        const diaStr = filtroDia.toString().padStart(2, '0');
        const mesStr = filtroMes.toString().padStart(2, '0');
        const fechaInicio = `${filtroAnio}-${mesStr}-${diaStr}`;
        let fechaFin;

        // Determinar el rango basado en el nivel de detalle
        if (dia) {
            fechaFin = new Date(filtroAnio, filtroMes - 1, filtroDia + 1).toISOString().split('T')[0];
        } else if (mes) {
            fechaFin = new Date(filtroAnio, filtroMes, 0).toISOString().split('T')[0]; // Fin del mes
        } else {
            fechaFin = `${filtroAnio}-12-31`;
        }

        // Consultar ventas y compras filtradas
        const ventas = await Venta.find({
            fechaVenta: { $gte: fechaInicio, $lte: fechaFin }
        });

        const compras = await Compra.find({
            fechaCompra: { $gte: fechaInicio, $lte: fechaFin }
        });

        const productos = await Producto.find();

        // Inicializar acumuladores
        let totalComprasKg = 0;
        let totalComprasDinero = 0;
        let totalVentasKg = 0;
        let totalVentasDinero = 0;

        const reporteProductos = await Promise.all(productos.map(async (producto) => {
            let cantidadComprada = 0;
            let cantidadVendida = 0;
            let valorCompras = 0;
            let valorVentas = 0;

            // Procesar compras
            compras.forEach(compra => {
                const detalle = compra.productos.find(p => p.productoId.equals(producto._id));
                if (detalle) {
                    cantidadComprada += detalle.cantidad;
                    valorCompras += detalle.subtotal;
                }
            });

            // Procesar ventas
            ventas.forEach(venta => {
                const detalle = venta.productos.find(p => p.productoId.equals(producto._id));
                if (detalle) {
                    cantidadVendida += detalle.cantidad;
                    valorVentas += detalle.subtotal;
                }
            });

            // Acumular para análisis general
            totalComprasKg += cantidadComprada;
            totalComprasDinero += valorCompras;
            totalVentasKg += cantidadVendida;
            totalVentasDinero += valorVentas;

            return {
                producto: producto.nombre,
                cantidadDisponible: producto.cantidadDisponible,
                cantidadComprada,
                cantidadVendida,
                valorCompras,
                valorVentas
            };
        }));

        // Calcular ganancia general
        const ganancia = totalVentasDinero - totalComprasDinero;

        // Respuesta consolidada
        res.status(200).json({
            fechaFiltro: { dia: filtroDia, mes: filtroMes, anio: filtroAnio },
            productos: reporteProductos,
            comprasVsVentas: {
                totalComprasKg,
                totalComprasDinero,
                totalVentasKg,
                totalVentasDinero,
                ganancia
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    obtenerReporteInventario,
};
