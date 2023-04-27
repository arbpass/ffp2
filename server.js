require('dotenv').config();
const express= require('express');
const app= express();
const ejs= require('ejs');
const path= require('path');
const expressLayout= require('express-ejs-layouts');
const mongoose= require('mongoose');
const session= require('express-session');
const flash= require('express-flash');
const MongoDbStore= require('connect-mongo');
const passport= require('passport');
const Emitter= require('events');
const PORT= process.env.port || 3000;


//Database connection
const url= process.env.MONGO_CONNECTION_URL;
const connection= mongoose.connect;
connection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> {
    console.log("Database connected...");
}).catch((e)=> {
    console.log(e);
})


//Event emitter
const eventEmitter= new Emitter();
app.set('eventEmitter', eventEmitter);


//Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: url,
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24} //24 hours
}))
app.use(flash())


//Passport config
const passportInit= require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());


//Global middlewares
app.use((req, res, next)=> {
    res.locals.session= req.session;
    res.locals.user= req.user;
    next();
})


//Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//Set template engines
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


//Routes
require('./routes/web')(app);
app.use((req, res)=> {
    res.status(404).render('errors/404.ejs');
})


const server= app.listen(PORT, ()=> {
    console.log('listening on port 3000');
})


//Socket
const io= require('socket.io')(server);
io.on('connection', (socket)=> {
    //Join
    socket.on('join', (roomName)=> {
        socket.join(roomName);
    })
})

eventEmitter.on('orderUpdated', (data)=> {
    io.to(`order-${data.id}`).emit('orderUpdated', data);
})

eventEmitter.on('orderPlaced', (data)=> {
    io.to('adminRoom').emit('orderPlaced', data);
})
