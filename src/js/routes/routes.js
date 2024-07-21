const express = require("express");
const router = express.Router();
const session = require("express-session");
const authRoutes = require("../routes/auth.js");
const User = require("../auth/user.js");
const { ensureAuthenticated, ensureNotAuthenticated } = require("../middleware/authenticated.js");
const ensureRole = require("../middleware/checkrole.js");

// Usa el router de autenticación en las rutas correspondientes
router.use("/auth", authRoutes);

router.get("/", (req, res) => {
    res.render("home", { user: req.user });
});

router.get("/login", ensureNotAuthenticated, (req, res) => {
    res.render("login", { 
        user: req.user, 
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg'),
        error: req.flash('error')
    });
});

router.get('/settings', ensureRole('Profesor', 'Alumno'),(req, res) => {
    res.render('settings', { user: req.user });
});

router.get("/register", ensureNotAuthenticated, (req, res) => {
    res.render("register", { user: req.user });
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

router.get("/alumns", ensureRole('Profesor'), async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName');
        res.render('alumnAll', { users, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

module.exports = router;