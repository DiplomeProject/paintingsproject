module.exports = (req, res, next) => {
    // We can remove the OPTIONS check because app.js handles preflight globally now.
    
    if (!req.session.user) {
       next();
    }
    next();
};