const mongoose = require('mongoose');
const { Schema } = mongoose;

const pagoSchema = new Schema({
    monto: { type: Number, required: true, default: 0 },
    fecha: { type: String, required: true }  // Cambiado de Date a String
});

const ventaSchema = new Schema(
    {
        clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
        productos: [
            {
                productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
                cantidad: { type: Number, required: true },
                precio: { type: Number, required: true },
                subtotal: { type: Number, required: true }
            }
        ],
        total: { type: Number, required: true },
        montoPagado: { type: Number, default: 0 },
        saldo: { type: Number, required: true },

        estado: {
            type: String,
            enum: ['pendiente', 'parcial', 'pagado'],
            default: 'pendiente'
        },
        fechaVenta: { type: String, required: true },  // Cambiado de Date a String
        pagos: [pagoSchema]
    },
    { timestamps: true }
);

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;