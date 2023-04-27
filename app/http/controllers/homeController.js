const Menu = require('../../models/menu');
const Cart = require('../../models/cart');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;


function homeController() {
    return {
        async index(req, res) {

            try {
                const foods = await Menu.find();
            const carts = await Cart.findOne({ userId: mongoose.Types.ObjectId(req.session.passport.user) });
            if (carts) {
                req.session.cart = {
                    items: {},
                    totalQty: 0, //initialize total quantity & price from 0
                    totalPrice: 0
                }
                
                req.session.cart.items = await JSON.parse(carts.items);
                req.session.cart.totalQty = await carts.totalQty;
                req.session.cart.totalPrice = await carts.totalPrice;
            }
            return res.render('home', { foods: foods });
            } catch (error) {
                res.redirect('/login')
            }

        }
    }
}


module.exports = homeController;