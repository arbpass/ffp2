const mongoose= require('mongoose');

const cartSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    items: {
        type: String,
        required: true,
    },

    totalQty: {
        type: Number,
        required: true,
    },

    totalPrice: {
        type: Number,
        required: true,
    }
}, { timestamps: true })

const Cart= mongoose.model('Cart', cartSchema);

module.exports= Cart;