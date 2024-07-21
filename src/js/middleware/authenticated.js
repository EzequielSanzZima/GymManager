module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.session && req.session.userId) {
            return next(); 
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/login'); 
    },
    ensureNotAuthenticated: function (req, res, next) {
        if (!req.session || !req.session.userId) {
            return next(); 
        }
        res.redirect('/');
    }
};