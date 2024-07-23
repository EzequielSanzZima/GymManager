const express = require("express");
const router = express.Router();
const session = require("express-session");
const authRoutes = require("../routes/auth.js");
const User = require("../auth/user.js");
const { ensureAuthenticated, ensureNotAuthenticated } = require("../middleware/authenticated.js");
const ensureRole = require("../middleware/checkrole.js");
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

router.get('/settings', ensureRole(['Profesor', 'Alumno', 'Secretario']),(req, res) => {
    res.render('settings', { currentUser: req.user });
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

router.get("/clients/:dni", async (req, res) => {
    try {
        const { dni } = req.params;
        const user = await User.findOne({ dni });

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        let nextPay = user.paymentDate;
        if (typeof nextPay === 'string') {
            nextPay = moment(nextPay, 'DD/MM/YYYY HH:mm A').toDate();
        }

        const newDate = nextPay ? moment(nextPay).add(1, 'month') : moment().add(1, 'month');
        const day = newDate.date();
        const month = newDate.month() + 1;
        const year = newDate.year();

        const nextPayMount = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

        await User.updateOne(
            { dni },
            { $set: { nextPayDate: nextPayMount } }
        );

        res.render('clientData', { user, currentUser: req.user, nextPayMount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving client');
    }
});



module.exports = router;