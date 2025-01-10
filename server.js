require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Rutas
const clienteRoutes = require('./routes/clienteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes = require('./routes/productoRoutes');
const compraRoutes = require('./routes/compraRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a la base de datos MongoDB'))
    .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Uso de rutas
app.use('/clientes', clienteRoutes);
app.use('/proveedores', proveedorRoutes);
app.use('/productos', productoRoutes);
app.use('/compras', compraRoutes);
app.use('/ventas', ventaRoutes);
app.use('/reportes', reporteRoutes);
app.use('/inventario', inventarioRoutes);

// Inicia el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
