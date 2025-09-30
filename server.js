const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;
const session = require('express-session');

const createDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!req.session.user || !req.session.user.email) {
            return cb(new Error('User not authenticated or email not found'), null);
        }
        const email = req.session.user.email;
        const userDir = path.join(__dirname, 'public', email.split('@')[0]);
        createDirectory(userDir);
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "artgallery"
});

app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-ijt', 'Authorization'],
    credentials: true 
}));


const start = async () => {
    try {
        await con.connect(err => {
            if (err) {
                console.error('Ошибка подключения к базе данных:', err);
                return;
            }
            console.log('Подключение к базе данных успешно установлено');
        });
        app.listen(port, () => console.log(`Server started on port ${port}`));
    } catch (e) {
        console.log(e);
    }
};

start();


app.get('/api/paintings', (req, res) => {
    const sql = `
        SELECT
            Paintings.Painting_ID, Paintings.title, Paintings.Image, paintings.Description ,
            Paintings.Creator_ID, creators.name AS author_name, creators.surname AS author_surname
        FROM Paintings
                 JOIN creators ON Paintings.Creator_ID = creators.Creator_ID
    `;
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении SQL запроса:', err);
            res.status(500).send('Error fetching paintings');
            return;
        }
        res.json(results);
    });
});

app.post('/register', (req, res) => {
    const { name, surname, email, password } = req.body;
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Ошибка хэширования:', err);
            return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
        }

        console.log('Данные для регистрации:', name, surname, email, hash);
        console.log('SQL query values:', [name, surname, email, hash]);

        const sql = `INSERT INTO creators (Name, Surname, Email, Password) VALUES (?, ?, ?, ?)`;
        con.query(sql, [name, surname, email, hash], (err, result) => {
            if (err) {
                console.error('Ошибка SQL:', err);
                return res.status(500).json({ error: 'Ошибка базы данных при регистрации пользователя' });
            }
            res.status(201).json({ success: true, message:'User registered'});
        });
    });
});

app.post('/checkEmail', (req, res) => {
    const { email } = req.body;

    const sql = 'SELECT Email FROM creators WHERE Email = ?';
    con.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса на проверку электронной почты:', err);
            return res.status(500).json({ error: 'Ошибка базы данных при проверке электронной почты' });
        }

        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

app.get('/some-page', (req, res) => {
    if (req.session.user) {
        res.send('This is some page with session');
    } else {
        res.send('No session available');
    }
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    const sql = 'SELECT * FROM creators WHERE Email = ?';
    con.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log("SQL query successful, number of results:", results.length);
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
        bcrypt.compare(password, results[0].Password, (err, result) => {
            console.log("Attempting to compare passwords", { inputPassword: password, storedHash: results[0].Password });
            if (!results[0].Password) {
                console.error('No password hash available in the database for the user.');
                return res.status(500).json({ success: false, message: 'No password hash available.' });
            }
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message:'Error checking password'});
            }
            console.log("Password comparison result:", result);
            if (result) {
                req.session.user = {
                    id: results[0].Creator_ID,
                    name: results[0].Name,
                    surname: results[0].Surname,
                    email: results[0].Email,
                    bio: results[0].Other_Details,
                    profileImage: results[0].Image || 'img/icons/profile.jpg'
                };
                res.json({ success: true, message: 'Login successful', user: req.session.user });
            } else {
                res.status(401).json({ success: false, message: 'Password mismatch' });
            }
        });
    });
});

app.get('/check-session', (req, res) => {
    if (req.session.user) {
        const userId = req.session.user.id;
        const sql = 'SELECT * FROM creators WHERE Creator_ID = ?';
        con.query(sql, [userId], (err, result) => {
            if (err) {
                console.error('Ошибка при выполнении SQL запроса:', err);
                return res.status(500).json({ loggedIn: false, message: 'Error fetching user data' });
            }
            if (result.length > 0) {
                const user = result[0];
                req.session.user = {
                    id: user.Creator_ID,
                    name: user.Name,
                    surname: user.Surname,
                    email: user.Email,
                    bio: user.Other_Details || '',
                    profileImage: user.Image || 'img/icons/profile.jpg' 
                };
                res.json({ loggedIn: true, user: req.session.user });
            } else {
                res.json({ loggedIn: false });
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.put('/paintings/:id', upload.single('image'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const paintingId = req.params.id;
    const { title, description } = req.body;
    const newImage = req.file ? req.file.filename : null;
    const email = req.session.user.email;
    const newImagePath = newImage ? path.join(email.split('@')[0], newImage) : null;
    
    const selectSql = 'SELECT Image FROM Paintings WHERE Painting_ID = ? AND Creator_ID = ?';
    const selectValues = [paintingId, req.session.user.id];

    con.query(selectSql, selectValues, (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Ошибка при получении текущего изображения:', selectErr);
            return res.status(500).json({ success: false, message: 'Error fetching current image' });
        }

        const currentImagePath = selectResult.length > 0 ? selectResult[0].Image : null;
        
        const updateSql = `
            UPDATE Paintings
            SET Title = ?, Description = ?, Image = ?
            WHERE Painting_ID = ? AND Creator_ID = ?
        `;
        const updateValues = [title, description, newImagePath || currentImagePath, paintingId, req.session.user.id];

        con.query(updateSql, updateValues, (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Ошибка при обновлении картины:', updateErr);
                return res.status(500).json({ success: false, message: 'Error updating painting' });
            }
            
            if (newImagePath && currentImagePath && currentImagePath !== 'img/icons/add_image.jpg') {
                const currentImageFullPath = path.join(__dirname, currentImagePath.replace(/^[\/\\]/, ''));

                console.log('New image path:', newImagePath);
                console.log('Current image path:', currentImagePath);
                console.log('Current image full path:', currentImageFullPath);

                if (fs.existsSync(currentImageFullPath)) {
                    fs.unlink(currentImageFullPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Ошибка при удалении старого изображения:', unlinkErr);
                        } else {
                            console.log('Старое изображение успешно удалено');
                        }
                    });
                } else {
                    console.error('Файл для удаления не найден:', currentImageFullPath);
                }
            }

            res.json({ success: true, message: 'Painting updated successfully' });
        });
    });
});

app.post('/update-profile', upload.single('profileImage'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userId = req.session.user.id;
    const { name, surname, bio, email } = req.body;
    const userDir = path.join(req.session.user.email.split('@')[0]);

    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    const newProfileImage = req.file ? path.join(userDir, req.file.filename) : null;
    const oldProfileImage = req.session.user.profileImage;

    const sql = `
        UPDATE creators
        SET Name = ?, Surname = ?, Other_Details = ?, Email = ?, Image = ?
        WHERE Creator_ID = ?
    `;
    const values = [name, surname, bio, email, newProfileImage || oldProfileImage, userId];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Ошибка при обновлении профиля:', err);
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }

        if (newProfileImage && oldProfileImage && oldProfileImage !== 'img/icons/profile.jpg') {
            const oldProfileImagePath = path.join(__dirname, oldProfileImage.replace(/^[\/\\]/, ''));

            console.log('New profile image path:', newProfileImage);
            console.log('Old profile image path:', oldProfileImage);
            console.log('Old profile image full path:', oldProfileImagePath);

            if (fs.existsSync(oldProfileImagePath)) {
                fs.unlink(oldProfileImagePath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении старого фото профиля:', err);
                    } else {
                        console.log('Старое фото профиля успешно удалено');
                    }
                });
            } else {
                console.error('Файл для удаления не найден:', oldProfileImagePath);
            }
        }

        req.session.user = { ...req.session.user, name, surname, bio, email, profileImage: newProfileImage || oldProfileImage };
        res.json({ success: true, message: 'Profile updated successfully', user: req.session.user });
    });
});

app.get('/loadPaintAuthor', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }

    const userId = req.session.user.id;
    const sql = `
        SELECT 
            Paintings.Painting_ID, Paintings.title, Paintings.Image, paintings.Description , 
            Paintings.Creator_ID, creators.name AS author_name, creators.surname AS author_surname
        FROM Paintings
        JOIN creators ON Paintings.Creator_ID = creators.Creator_ID
        WHERE Paintings.Creator_ID = ?;
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении SQL запроса:', err);
            res.status(500).send('Error fetching paintings');
            return;
        }
        res.json(results);
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Ошибка при выходе из системы:', err);
            return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout successful' });
    });
});


app.post('/upload', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!req.session.user || !title || !description || !image) {
        return res.status(400).json({ success: false, message: 'Все поля должны быть заполнены' });
    }

    const email = req.session.user.email;
    const imagePath = path.join(email.split('@')[0], image); // Формируем относительный путь к изображению

    const sql = `INSERT INTO Paintings (Title, Description, Creator_ID, Creation_Date, Image) VALUES (?, ?, ?, NOW(), ?)`;
    const values = [title, description, req.session.user.id, imagePath];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).json({ success: false, message: 'Ошибка базы данных при добавлении картины' });
        }
        res.status(201).json({ success: true, message: 'Картина успешно добавлена' });
    });
});

app.get('/api/creator/:id', (req, res) => {
    const creatorId = req.params.id;

    const sqlCreator = 'SELECT * FROM creators WHERE Creator_ID = ?';
    const sqlPaintings = 'SELECT * FROM Paintings WHERE Creator_ID = ?';

    con.query(sqlCreator, [creatorId], (err, creatorResults) => {
        if (err) {
            console.error('Ошибка при выполнении SQL запроса:', err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }

        if (creatorResults.length === 0) {
            return res.status(404).json({ error: 'Автор не найден' });
        }

        const creator = creatorResults[0];

        con.query(sqlPaintings, [creatorId], (err, paintingResults) => {
            if (err) {
                console.error('Ошибка при выполнении SQL запроса:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            res.json({
                name: creator.Name,
                surname: creator.Surname,
                bio: creator.Other_Details,
                email: creator.Email,
                profileImage: creator.Image || 'img/icons/profile.jpg',
                paintings: paintingResults
            });
        });
    });
});

app.delete('/paintings/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const paintingId = req.params.id;
    const userId = req.session.user.id;
    
    const selectSql = 'SELECT Image FROM Paintings WHERE Painting_ID = ? AND Creator_ID = ?';
    con.query(selectSql, [paintingId, userId], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении SQL запроса:', err);
            return res.status(500).json({ success: false, message: 'Error fetching painting' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Картина не найдена' });
        }

        const imagePath = path.join(results[0].Image.replace(/^[\/\\]/, ''));
        
        const deleteSql = 'DELETE FROM Paintings WHERE Painting_ID = ? AND Creator_ID = ?';
        con.query(deleteSql, [paintingId, userId], (err, result) => {
            if (err) {
                console.error('Ошибка при выполнении SQL запроса:', err);
                return res.status(500).json({ success: false, message: 'Error deleting painting' });
            }
            
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении изображения:', err);
                    } else {
                        console.log('Изображение успешно удалено:', imagePath);
                    }
                });
            } else {
                console.error('Изображение для удаления не найдено:', imagePath);
            }

            res.json({ success: true, message: 'Картина успешно удалена' });
        });
    });
});
