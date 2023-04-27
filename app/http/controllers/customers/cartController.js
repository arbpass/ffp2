const Cart = require('../../../models/cart');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

function cartController() {
    return {
        index(req, res) {
            res.render('customers/cart');
        },
        update(req, res) {

            //For the first time creating cart (includ cart in session)
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0, //initialize total quantity & price from 0
                    totalPrice: 0
                }

                const cart = new Cart({
                    userId: req.session.passport.user,
                    items: JSON.stringify({ key: 'value' }),
                    totalQty: 0, //initialize total quantity & price from 0
                    totalPrice: 0
                })
                cart.save();
            }
            let cart = req.session.cart;

            //Check if item doesn't exist in the cart
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1,
                }
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;

                MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                    let db = client.db('ffp');
                    db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify(req.session.cart.items), totalQty: req.session.cart.totalQty, totalPrice:req.session.cart.totalPrice } })
                });
            }
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;

                MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                    let db = client.db('ffp');
                    db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify(req.session.cart.items), totalQty: req.session.cart.totalQty, totalPrice:req.session.cart.totalPrice } })
                });
            }

            return res.json({ totalQty: req.session.cart.totalQty, cartItem: cart.items[req.body._id], totalPrice: cart.totalPrice });
        },
        updateRemove(req, res) {

            //For the first time creating cart (includ cart in session)
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0, //initialize total quantity & price from 0
                    totalPrice: 0
                }
            }
            let cart = req.session.cart;

            if (cart.totalQty == 1) {
                delete req.session.cart;
                MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                    let db = client.db('ffp');
                    db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify({}), totalQty: 0, totalPrice: 0 } })
                });
                return res.json({ totalQty: 0, totalPrice: 0 })
            }
            //Check if item doesn't exist in the cart or if item quantity is only one
            if (!cart.items[req.body._id] || cart.items[req.body._id].qty == 1) {
                delete req.session.cart.items[req.body._id];
                cart.totalQty = cart.totalQty - 1;
                cart.totalPrice = cart.totalPrice - req.body.price;

                MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                    let db = client.db('ffp');
                    db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify(req.session.cart.items), totalQty: req.session.cart.totalQty, totalPrice:req.session.cart.totalPrice } })
                });

                return res.json({ totalQty: req.session.cart.totalQty, totalPrice: cart.totalPrice });
            }
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty - 1;
                cart.totalQty = cart.totalQty - 1;
                cart.totalPrice = cart.totalPrice - req.body.price;

                MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                    let db = client.db('ffp');
                    db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify(req.session.cart.items), totalQty: req.session.cart.totalQty, totalPrice:req.session.cart.totalPrice } })
                });
            }

            return res.json({ totalQty: req.session.cart.totalQty, cartItem: cart.items[req.body._id], totalPrice: cart.totalPrice });
        }
    }
}


module.exports = cartController;