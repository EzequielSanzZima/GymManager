const ensureRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.rol === role) {
            return next();
        } else {
            req.flash('error_msg', 'No tienes permiso para acceder a esta página.');
            return res.redirect('/');
        }
    };
};

module.exports = ensureRole;