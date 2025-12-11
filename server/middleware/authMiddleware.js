module.exports = (req, res, next) => {
    // allow preflight
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    next();
};
