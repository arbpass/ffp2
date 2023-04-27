const Order = require('../../../models/order');

function statusController() {
    return {
        update(req, res) {
            if (req.body.status == "completed") {
                Order.updateOne({ _id: req.body.orderId }, { status: req.body.status, paymentStatus: true }, (err, data) => {
                    if (err) {
                        return res.redirect('/admin/orders');
                    }

                    //Send emit event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
                    return res.redirect('/admin/orders');
                })
            }
            else {
                Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, data) => {
                    if (err) {
                        return res.redirect('/admin/orders');
                    }

                    //Send emit event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
                    return res.redirect('/admin/orders');
                })
            }
        }
    }
}

module.exports = statusController;