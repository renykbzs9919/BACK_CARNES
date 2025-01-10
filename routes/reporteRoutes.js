const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/reporteController');

// Ruta para el resumen del dashboard
router.get('/summary', dashboardController.getDashboardSummary);

// Ruta para reportes por rango de fechas (startDate y endDate en query)
router.get('/report-by-date', dashboardController.getReportByDateRange);

// Ruta para reportes diarios
router.get('/daily-report', dashboardController.getDailyReport);

// Ruta para reportes semanales
router.get('/weekly-report', dashboardController.getWeeklyReport);

// Ruta para reportes mensuales
router.get('/monthly-report', dashboardController.getMonthlyReport);

// Ruta para reportes por cliente (requiere clienteId como parámetro)
router.get('/report-by-client/:clienteId', dashboardController.getReportByClient);

// Ruta para reportes por cliente (requiere clienteId como parámetro)
router.get('/report-by-proveedor/:proveedorId', dashboardController.getReportByProveedor);

module.exports = router;
