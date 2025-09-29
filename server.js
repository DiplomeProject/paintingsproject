import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import crypto from 'crypto';

const app = express();
const port = process.env.PORT || 8080;
const db = new sqlite3.Database('./artgallery.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS creators (
            Creator_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Surname TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL,
            Other_Details TEXT,
            Image TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Paintings (
            Painting_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Title TEXT NOT NULL,
            Description TEXT NOT NULL,
            Creator_ID INTEGER NOT NULL,
            Creation_Date TEXT DEFAULT CURRENT_TIMESTAMP,
            Image TEXT,
            FOREIGN KEY (Creator_ID) REFERENCES creators (Creator_ID)
        )
    `);
});

const createDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!req.session.user || !req.session.user.email) {
            return cb(new Error('User not authenticated or email not found'), null);
        }
        const email = req.session.user.email;
        const userDir = path.join('public', email.split('@')[0]);
        createDirectory(userDir);
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-ijt', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/paintings', (req, res) => {
    const sql = `
        SELECT p.Painting_ID, p.Title, p.Image, p.Description,
               p.Creator_ID, c.Name AS author_name, c.Surname AS author_surname
        FROM Paintings p
        JOIN creators c ON p.Creator_ID = c.Creator_ID
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching paintings');
        }
        res.json(rows);
    });
});

app.post('/register', (req, res) => {
    const { name, surname, email, password } = req.body;
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Ошибка хэширования' });

        const sql = `INSERT INTO creators (Name, Surname, Email, Password) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, surname, email, hash], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ошибка при регистрации' });
            }
            res.status(201).json({ success: true, message: 'User registered' });
        });
    });
});

app.post('/checkEmail', (req, res) => {
    const { email } = req.body;
    db.get('SELECT Email FROM creators WHERE Email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ exists: !!row });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM creators WHERE Email = ?', [email], (err, user) => {
        if (err) return res.status(500).send('DB error');
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        bcrypt.compare(password, user.Password, (err, result) => {
            if (err) return res.status(500).send('Error comparing passwords');
            if (!result) return res.status(401).json({ success: false, message: 'Password mismatch' });

            req.session.user = {
                id: user.Creator_ID,
                name: user.Name,
                surname: user.Surname,
                email: user.Email,
                bio: user.Other_Details || '',
                profileImage: user.Image || 'img/icons/profile.jpg'
            };
            res.json({ success: true, message: 'Login successful', user: req.session.user });
        });
    });
});

app.get('/check-session', (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });
    const { id } = req.session.user;

    db.get('SELECT * FROM creators WHERE Creator_ID = ?', [id], (err, user) => {
        if (err) return res.status(500).json({ loggedIn: false });
        if (!user) return res.json({ loggedIn: false });

        req.session.user = {
            id: user.Creator_ID,
            name: user.Name,
            surname: user.Surname,
            email: user.Email,
            bio: user.Other_Details || '',
            profileImage: user.Image || 'img/icons/profile.jpg'
        };
        res.json({ loggedIn: true, user: req.session.user });
    });
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


app.post("/addPainting", (req, res) => {
  const { userId, image } = req.body;

  if (!userId || !image) {
    return res.status(400).json({ error: "User ID and profile picture are required." });
  }

  db.run("UPDATE Paintings SET Image = ? WHERE Creator_ID = ?", [image, userId], (err) => {
    if (err) {
      console.error("Error updating profile picture:", err.message);
      return res.status(500).json({ error: "Error updating profile picture in database." });
    }
    res.json({ message: "Profile picture updated successfully." });
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


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
