const homeController= require('../app/http/controllers/homeController');
const authController= require('../app/http/controllers/authController');
const cartController= require('../app/http/controllers/customers/cartController');
const orderController= require('../app/http/controllers/customers/orderController');
const adminOrderController= require('../app/http/controllers/admin/orderController');
const statusController= require('../app/http/controllers/admin/statusController');
const addController= require('../app/http/controllers/admin/addController');

//Middlewares
const guest= require('../app/http/middleware/guest');
const auth= require('../app/http/middleware/auth');
const admin= require('../app/http/middleware/admin');


function initRoutes(app) {

    app.get('/', homeController().index)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)

    app.get('/register', guest, authController().register)
    app.post('/register', authController().postRegister)
    app.post('/logout', authController().logout)

    app.get('/cart', cartController().index)
    app.post('/update-cart', cartController().update)
    app.post('/update-remove-cart', cartController().updateRemove)
    
    //Customer routes
    app.post('/orders', auth, orderController().store)
    app.post('/payment', auth, orderController().payment)
    app.post('/payment-completed/:orderId', auth, orderController().paymentCompleted)
    app.get('/customers/orders', auth, orderController().index)
    app.get('/customers/orders/:id', auth, orderController().show)

    //Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    app.post('/admin/orders/status', admin, statusController().update)
    app.post('/add-product', admin, addController().addProduct)
    app.post('/delete-product', admin, addController().deleteProduct)
    app.post('/available', admin, addController().availableProduct)
    
}


module.exports= initRoutes;