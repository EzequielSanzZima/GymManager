module.exports = (req, res, next) => {
    res.locals.User = req.user;
    next();
};