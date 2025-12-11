module.exports = (req, res, next) => {
    // We can remove the OPTIONS check because app.js handles preflight globally now.
    
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    next();
};