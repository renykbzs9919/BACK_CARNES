const Cliente = require('../models/Cliente');
const Proveedor = require('../models/Proveedor');
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');
const Compra = require('../models/Compra');
const moment = require('moment'); // Para manejar fechas fácilmente

const dashboardController = {
    // Resumen de las ventas y compras (Dashboard)
    getDashboardSummary: async (req, res) => {
        try {
            const ventas = await Venta.aggregate([
                { $group: { _id: null, totalVentas: { $sum: '$total' }, totalPagado: { $sum: '$montoPagado' }, totalSaldo: { $sum: '$saldo' } } }
            ]);

            const compras = await Compra.aggregate([
                { $group: { _id: null, totalCompras: { $sum: '$total' }, totalPagado: { $sum: '$montoPagado' }, totalSaldo: { $sum: '$saldo' } } }
            ]);

            res.status(200).json({
                ventas: ventas[0] || { totalVentas: 0, totalPagado: 0, totalSaldo: 0 },
                compras: compras[0] || { totalCompras: 0, totalPagado: 0, totalSaldo: 0 }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el resumen del dashboard', error });
        }
    },

    // Reportes de ventas, compras, etc. por fecha
    getReportByDateRange: async (req, res) => {
        const { startDate, endDate } = req.query;

        // Asegurarse de que las fechas son válidas
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Las fechas de inicio y fin son requeridas." });
        }

        try {
            const start = moment(startDate).startOf('day').toDate();
            const end = moment(endDate).endOf('day').toDate();

            // Reporte de ventas por rango de fechas
            const ventas = await Venta.find({
                fechaVenta: { $gte: start, $lte: end }
            });

            // Reporte de compras por rango de fechas
            const compras = await Compra.find({
                fechaCompra: { $gte: start, $lte: end }
            });

            res.status(200).json({ ventas, compras });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los reportes por fecha', error });
        }
    },

    // Reporte de ventas diarias
    getDailyReport: async (req, res) => {
        const today = moment().startOf('day').toDate();
        try {
            const ventas = await Venta.find({ fechaVenta: { $gte: today } });

            res.status(200).json({ ventas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el reporte diario', error });
        }
    },

    // Reporte de ventas semanales
    getWeeklyReport: async (req, res) => {
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        try {
            const ventas = await Venta.find({
                fechaVenta: { $gte: startOfWeek, $lte: endOfWeek }
            });

            res.status(200).json({ ventas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el reporte semanal', error });
        }
    },

    // Reporte de ventas mensuales
    getMonthlyReport: async (req, res) => {
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        try {
            const ventas = await Venta.find({
                fechaVenta: { $gte: startOfMonth, $lte: endOfMonth }
            });

            res.status(200).json({ ventas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el reporte mensual', error });
        }
    },

    // Reporte de ventas por cliente
    getReportByClient: async (req, res) => {
        const { clienteId } = req.params;

        if (!clienteId) {
            return res.status(400).json({ message: 'El ID del cliente es requerido.' });
        }

        try {
            const ventas = await Venta.find({ clienteId });
            res.status(200).json({ ventas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el reporte de ventas por cliente', error });
        }
    },

    //Reporte de ventas por proveedor
    getReportByProveedor: async (req, res) => {
        const { proveedorId } = req.params;

        if (!proveedorId) {
            return res.status(400).json({ message: 'El ID del proveedor es requerido.' });
        }

        try {
            const compras = await Compra.find({ proveedorId });
            res.status(200).json({ compras });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el reporte de compras por proveedor', error });
        }
    }
};

module.exports = dashboardController;
