const Menu = require('../../../models/menu')
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

function addController() {
    return {
        addProduct(req, res) {
            const { productName, imageLink, productPrice, productSize } = req.body;

            //Create a new menu
            const menu = new Menu({
                name: productName,
                image: imageLink,
                price: productPrice,
                size: productSize,
                available: true,
            })

            menu.save().then(() => {
                //Login
                return res.redirect('/');
            }).catch(err => {
                req.flash('error', 'Something went wrong!');
                return res.redirect('/');
            })
        },

        deleteProduct(req, res) {
            // console.log(req.body);

            Menu.findByIdAndRemove(req.body.foodId, (err, doc) => {
                if (!err) {
                    res.redirect('/');
                }
                else { console.log('Error in employee delete :' + err); }
            });
        },

        availableProduct(req, res) {
            // console.log(req.body);

            MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                let db = client.db('ffp');
                db.collection("menus").findOne({ _id: mongoose.Types.ObjectId(req.body.foodId) }).then(
                    res => {
                        // console.log(res);

                        if (res.available == true) {
                            db.collection("menus").findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.foodId) }, { $set: { available: false } });
                        } else {
                            db.collection("menus").findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.foodId) }, { $set: { available: true } });
                        }
                    }
                )


                if (!err) {
                    res.redirect('/');
                }
                else { console.log('Error in employee delete :' + err); }
            });
        }
    }
}


module.exports = addController;