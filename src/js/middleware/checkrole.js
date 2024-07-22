const ensureRole = (role) => {
    return (req, res, next) => {
        if (req.user && role.includes(req.user.rol)) {
            return next();
        } else {
            return res.redirect('/');
        }
    };
};

module.exports = ensureRole;