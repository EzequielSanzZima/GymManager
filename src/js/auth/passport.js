const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./user.js');
const bcrypt = require("bcryptjs")

passport.use(new LocalStrategy(
    { usernameField: 'dni' },
    async (dni, password, done) => {
        try {
            const user = await User.findOne({ dni });
            if (!user) {
                return done(null, false, { message: 'No user with that DNI' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
