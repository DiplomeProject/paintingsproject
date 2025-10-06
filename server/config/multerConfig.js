const multer = require('multer');
const path = require('path');
const createDirectory = require('../utils/createDirectory');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!req.session.user || !req.session.user.email) {
            return cb(new Error('User not authenticated or email not found'), null);
        }
        const email = req.session.user.email;
        const userDir = path.join(__dirname, '..', 'public', email.split('@')[0]);
        createDirectory(userDir);
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

module.exports = { upload, uploadMemory };
