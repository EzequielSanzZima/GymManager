const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require("../auth/user.js");
const multer = require('multer');
const passport = require('passport');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const moment = require("moment")
const { timeInArgentina, DayInArgentina } = require("../utils/timeInArgentina.js")

// Manejar el registro de usuarios
router.post("/register", upload.single('avatar'), async (req, res) => {
    try {
        const { email, password, firstName, lastName, day, month, year, dni, contactNumber, address, rol, pass, hasPaid } = req.body;

        const birthdate = new Date(`${year}-${month}-${day}`);
        const time = timeInArgentina();
        const hasPaidBool = hasPaid === 'Yes';
        const paymentDate = hasPaidBool ? timeInArgentina() : null;

        let existingDNI = await User.findOne({ dni });
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error_msg', 'Email already exists');
            return res.redirect("/register");
        }
        if (existingDNI) {
            req.flash('error_msg', 'DNI already exists');
            return res.redirect("/register");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            rol,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthdate,
            dni,
            contactNumber,
            address,
            avatar: req.file.buffer,
            registerTime: time,
            pass,
            hasPaid: hasPaidBool,
            paymentDate,
        });
        
        await newUser.save();
        
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'An error occurred: ' + error.message);
        res.redirect("/register");
    }
});



// Manejar el login de usuarios manualmente
router.post('/login', passport.authenticate('local') ,async (req, res) => {
    const { dni, password } = req.body;

        if (!dni || !password) {
            req.flash('error_msg', 'DNI y contraseña son requeridos');
            return res.redirect('/login');
        }

    try {
        const user = await User.findOne({ dni });
        if (!user) {
            req.flash('error_msg', 'No encontraron un usuario con ese DNI');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Contrasena incorrecta');
            return res.redirect('/login');
        }

        req.login(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                req.flash('error_msg', 'Login error');
                return res.redirect('/login');
            }

            req.session.userId = user._id
            res.cookie('name', user.firstName, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });

            req.flash('success_msg', 'Successfully logged in');
            return res.redirect('/');
        });
    } catch (err) {
        req.flash('error_msg', 'An error occurred');
        res.redirect('/login');
    }
});


//Eliminar cuenta
router.post('/delete-account', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        await User.findByIdAndDelete(userId);

        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error al cerrar sesión después de eliminar la cuenta.');
            }

            res.clearCookie('connect.sid');
            res.clearCookie('remember_me');
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        res.status(500).send('Error al eliminar la cuenta.');
    }
});

//cambiar contrasena
router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    console.log(currentPassword, newPassword, confirmNewPassword)
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        if(currentPassword == isMatch){
            return res.status(401).json({ error: 'Ingresa otra nueva contraseña.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Contraseña cambiada con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error al cambiar la contraseña.' });
    }
});

//Verifica si el usuario puede entrar al local
router.post('/verify-access', async (req, res) => {
    const { dni } = req.body;

    try {
        const user = await User.findOne({ dni });

        if (!user) {
            req.flash('error_msg', 'Usuario no encontrado');
            return res.redirect('/access');
        }

        const today = DayInArgentina();

        if (user.lastAccess === today) {
            req.flash('error_msg', 'Ya has accedido hoy, no puedes ingresar nuevamente.');
            return res.redirect('/access');
        }

        const paymentDate = moment(user.paymentDate, 'DD/MM/YYYY');
        const todayDate = moment(today, 'DD/MM/YYYY');

        if (paymentDate.isBefore(todayDate)) {
            req.flash('error_msg', 'Tu pase ha expirado, no puedes ingresar.');
            return res.redirect('/access');
        }

        user.lastAccess = today;
        await user.save();

        res.render('accessSuccess', { user });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Error en el servidor');
    }
});


module.exports = router;
