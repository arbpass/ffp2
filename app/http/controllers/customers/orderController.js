const Order = require('../../../models/order')
const moment = require('moment')
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const Razorpay=require("razorpay");
const razorpay= new Razorpay({
    key_id: 'rzp_test_1fTjSvIIgBkt6M',
    key_secret: 'R2CDK8zeMTezejzP0yPNyjZh',
})

function orderController() {
    return {
        store(req, res) {
            //Validate request
            const { phone, address } = req.body;
            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }
            // console.log(req.session.cart)
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
                totalPrice: req.session.cart.totalPrice
            })

            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    req.flash('success', 'Order placed successfully!');
                    delete req.session.cart;
                    MongoClient.connect(process.env.MONGO_CONNECTION_URL, function (err, client) {
                        let db = client.db('ffp');
                        db.collection("carts").findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.session.passport.user) }, { $set: { items: JSON.stringify({}), totalQty: 0, totalPrice: 0 } })
                    });
                    
                    //Emit
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderPlaced', placedOrder);
                    return res.redirect('/customers/orders');
                })
            }).catch(err => {
                req.flash('error', 'Something went wrong!');
                return res.redirect('/cart');
            })
        },

        payment(req,res) {
            
            let options = {
                amount: req.body.amount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "order_rcptid_11"
              };
        
              razorpay.orders.create(options, (err, order)=> {
                //   console.log(order);
                  res.json(order);
              })
        },

        paymentCompleted(req, res) {
            
            razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocumnet)=> {
                // console.log(paymentDocumnet);
                if(paymentDocumnet.status == 'captured')
                {
                    console.log("successsssssss");
                    MongoClient.connect(process.env.MONGO_CONNECTION_URL, function(err, client) {
                        let db = client.db('ffp'); 
                        db.collection("orders").findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.orderId)}, {$set:{paymentStatus:true, paymentType: "Online"}})
                    
                        if (!err) {
                            res.redirect('/customers/orders');
                        }
                        else { console.log('Error in employee delete :' + err); }
                        });
                }
            })
        },
              
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } });
            res.header('Cache-Control', 'no-store');
            res.render('customers/orders', { orders: orders, moment: moment });
        },

        async show(req, res) {
            const order = await Order.findById(req.params.id);

            //Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order: order });
            }
            res.redirect('/');
        }
    }
}

module.exports = orderController;