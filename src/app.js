require('dotenv').config();
const express = require("express");
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require('path');
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;
const setupSocket = require("./js/middleware/socketio.js")

const app = express();
require("./js/auth/passport.js");
const server = createServer(app);

const Mongo_URL = process.env.MONGO_URL;
const secret = process.env.SECRET;
const PORT = process.env.PORT || 3000;

// Configuración de Passport
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/pages/routes'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cookieParser(secret));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// app.use(setUser);

app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Usa las rutas
const routes = require("./js/routes/routes.js");
const authRoutes = require("./js/routes/auth.js");

app.use(routes);
app.use(authRoutes);

mongoose.connect(Mongo_URL, {
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => console.log(err));


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

setupSocket(server);
// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
