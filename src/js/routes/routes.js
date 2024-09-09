const express = require("express");
const router = express.Router();
const session = require("express-session");
const authRoutes = require("../routes/auth.js");
const User = require("../auth/user.js");
const { ensureAuthenticated, ensureNotAuthenticated } = require("../middleware/authenticated.js");
const ensureRole = require("../middleware/checkrole.js");
const { calculateNextPayDate } = require("../utils/AddMountPay.js")
const moment = require("moment")

router.use("/auth", authRoutes);

router.get("/", (req, res) => {
    res.render("home", { currentUser: req.user });
});

router.get("/login", (req, res) => {
    res.render("login", { 
        currentUser: req.user, 
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        error: req.flash('error')
    });
});

router.get('/settings', ensureRole(['Profesor', 'Alumno', 'Secretario']), async(req, res) => {
    const { dni } = req.params;
    const user = User.findOne({ dni });
    const nextPayMount = calculateNextPayDate(user.paymentDate);
    res.render('settings', { currentUser: req.user, nextPayMount });
});

router.get("/register", (req, res) => {
    res.render("register", { currentUser: req.user });
});

router.get("/logout", ensureAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error_msg', 'Logout error');
            return res.redirect("/");
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect("/");
    });
});

router.get("/avatar/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            return res.status(404).send("Avatar not found");
        }

        res.set("Content-Type", "image/jpeg");
        res.send(user.avatar);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/alumns", ensureRole(['Profesor', 'Secretario']), async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName');
        res.render('alumnAll', { users, currentUser: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

router.get("/teacherchat", ensureRole(['Profesor', 'Secretario']), (req, res) =>{
    res.render('teacherChat', { currentUser: req.user });
})


//Secretaria
router.get("/clients", ensureRole(['Secretario']), async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName dni');
        res.render('foundsClients', { users, currentUser: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

router.get("/clients/:dni", ensureRole(['Secretario']), async (req, res) => {
    try {
        const { dni } = req.params;
        const user = await User.findOne({ dni });

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        const nextPayMount = calculateNextPayDate(user.paymentDate);

        res.render('clientData', { user, currentUser: req.user, nextPayMount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving client');
    }
});

//Login In local

router.get('/access',async (req, res) => {
    res.render('access');
});


module.exports = router;