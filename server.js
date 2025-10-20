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
    database: "PaintingsDB"
});

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "PaintingsDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise wrapper
const db = pool.promise();

module.exports = db;
    
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
            Paintings.Creator_ID, creators.name AS author_name
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
    const { username, email, password, birthday } = req.body;

    console.log("📩 Incoming registration request:", { username, email, password, birthday });

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('❌ Password hashing error:', err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        console.log("🔑 Password successfully hashed:", hash);

        let formattedBirthday = null;
        if (birthday) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
                formattedBirthday = birthday; 
                console.log("Birthday formatted:", formattedBirthday);
            } else {
                console.error("Invalid birthday format received:", birthday);
                return res.status(400).json({ error: "Invalid birthday format" });
            }
        } else {
            console.log("ℹ️ No birthday provided");
        }

        const sql = `INSERT INTO creators (Name, Email, Password, Birthday) VALUES (?, ?, ?, ?)`;
        console.log("📤 Executing SQL:", sql);
        console.log("📦 Values:", [username, email, hash, formattedBirthday]);

        con.query(sql, [username, email, hash, formattedBirthday], (err, result) => {
            if (err) {
                console.error('❌ SQL error:', err.sqlMessage);
                console.error('🔍 Full error object:', err);
                return res.status(500).json({ error: 'Database error during registration' });
            }
            console.log("✅ Inserted new user, MySQL result:", result);
            res.status(201).json({ success: true, message: 'User registered' });
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
        
        if (!results[0].Password) {
            console.error('No password hash available in the database for the user.');
            return res.status(500).json({ success: false, message: 'No password hash available.' });
        }
        
        bcrypt.compare(password, results[0].Password, (err, result) => {
            console.log("Attempting to compare passwords");
            
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Error checking password' });
            }
            
            console.log("Password comparison result:", result);
            
            if (result) {
                const imageData = results[0].Image;
                let profileImage;
                
                if (Buffer.isBuffer(imageData)) {
                    profileImage = `data:image/jpeg;base64,${imageData.toString('base64')}`;
                } else if (typeof imageData === 'string') {
                    profileImage = imageData;
                } else {
                    profileImage = 'img/icons/profile.jpg';
                }
                
                req.session.user = {
                    id: results[0].Creator_ID,
                    name: results[0].Name,
                    email: results[0].Email,
                    bio: results[0].Other_Details,
                    profileImage: profileImage,
                    _imageBlob: Buffer.isBuffer(imageData) ? imageData : null
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
                
                // Handle profile image - check if it's a Buffer (BLOB) or string (file path)
                const imageData = user.Image;
                let profileImage;
                
                if (Buffer.isBuffer(imageData)) {
                    // It's a BLOB - convert to base64
                    profileImage = `data:image/jpeg;base64,${imageData.toString('base64')}`;
                } else if (typeof imageData === 'string') {
                    // It's a file path
                    profileImage = imageData;
                } else {
                    // No image - use default
                    profileImage = 'img/icons/profile.jpg';
                }
                
                req.session.user = {
                    id: user.Creator_ID,
                    name: user.Name,
                    email: user.Email,
                    bio: user.Other_Details || '',
                    profileImage: profileImage,
                    _imageBlob: Buffer.isBuffer(imageData) ? imageData : null
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

const uploadMemory = multer({ storage: multer.memoryStorage() });

app.post('/update-profile', uploadMemory.single('profileImage'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userId = req.session.user.id;
    const { name, bio, email } = req.body;

    const newProfileImageBuffer = req.file ? req.file.buffer : null;

    const sql = `
        UPDATE creators
        SET Name = ?, Other_Details = ?, Email = ?, Image = ?
        WHERE Creator_ID = ?
    `;
    const values = [
        name,
        bio,
        email,
        newProfileImageBuffer || req.session.user._imageBlob || null,
        userId
    ];

    con.query(sql, values, (err) => {
        if (err) {
            console.error('Ошибка при обновлении профиля:', err);
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }

        // Convert to base64 for frontend display
        const profileImageBase64 = newProfileImageBuffer
            ? `data:image/jpeg;base64,${newProfileImageBuffer.toString('base64')}`
            : req.session.user.profileImage;

        req.session.user = {
            ...req.session.user,
            name,
            bio,
            email,
            profileImage: profileImageBase64,
            _imageBlob: newProfileImageBuffer || req.session.user._imageBlob || null
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: req.session.user
        });
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
            Paintings.Creator_ID, creators.name AS author_name 
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
        
        // Handle profile image
        const imageData = creator.Image;
        let profileImage;
        
        if (Buffer.isBuffer(imageData)) {
            profileImage = `data:image/jpeg;base64,${imageData.toString('base64')}`;
        } else if (typeof imageData === 'string') {
            profileImage = imageData;
        } else {
            profileImage = 'img/icons/profile.jpg';
        }

        con.query(sqlPaintings, [creatorId], (err, paintingResults) => {
            if (err) {
                console.error('Ошибка при выполнении SQL запроса:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            res.json({
                name: creator.Name,
                bio: creator.Other_Details,
                email: creator.Email,
                profileImage: profileImage,
                paintings: paintingResults
            });
        });
    });
});

app.get('/api/search', (req, res) => {
    const { query, field } = req.query;

    // If no query provided, return all paintings
    if (!query || query.trim() === '') {
        const sql = `
            SELECT 
                Painting_ID,
                Title,
                Description,
                Style,
                Price,
                Image,
                Creation_Date,
                Author
            FROM Paintings
            ORDER BY Painting_ID
        `;
        
        con.query(sql, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            return res.json({ success: true, results, count: results.length });
        });
        return;
    }

    const searchTerm = `%${query.trim()}%`;
    let sql;
    let params;

    switch(field) {
        case 'title':
            sql = `
                SELECT 
                    Painting_ID,
                    Title,
                    Description,
                    Style,
                    Price,
                    Image,
                    Creation_Date,
                    Author
                FROM Paintings
                WHERE LOWER(Title) LIKE LOWER(?)
                ORDER BY Title
            `;
            params = [searchTerm];
            break;
            
        case 'author':
            sql = `
                SELECT 
                    Painting_ID,
                    Title,
                    Description,
                    Style,
                    Price,
                    Image,
                    Creation_Date,
                    Author
                FROM Paintings
                WHERE LOWER(Author) LIKE LOWER(?)
                ORDER BY Author, Title
            `;
            params = [searchTerm];
            break;
            
        case 'style':
            sql = `
                SELECT 
                    Painting_ID,
                    Title,
                    Description,
                    Style,
                    Price,
                    Image,
                    Creation_Date,
                    Author
                FROM Paintings
                WHERE LOWER(Style) LIKE LOWER(?)
                ORDER BY Style, Title
            `;
            params = [searchTerm];
            break;
            
        default: // 'all' or no field specified
            sql = `
                SELECT 
                    Painting_ID,
                    Title,
                    Description,
                    Style,
                    Price,
                    Image,
                    Creation_Date,
                    Author
                FROM Paintings
                WHERE LOWER(Title) LIKE LOWER(?) 
                   OR LOWER(Author) LIKE LOWER(?) 
                   OR LOWER(Style) LIKE LOWER(?)
                   OR LOWER(Description) LIKE LOWER(?)
                ORDER BY Painting_ID
            `;
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    con.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database search error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database search error',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        res.json({
            success: true,
            results,
            count: results.length,
            searchTerm: query.trim(),
            searchField: field || 'all'
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



// 1. СТВОРЕННЯ ПУБЛІЧНОГО КОМІШЕНУ
app.post('/api/commissions/public', upload.single('referenceImage'), async (req, res) => {
    /*if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }*/

    const { title, description, category, style, size, format, price } = req.body;
    const user = req.session.user || { id: 1, email: 'test@example.com' }; // for testing

    const referenceImage = req.file
        ? path.join(user.email.split('@')[0], req.file.filename)
        : null;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    const sql = `
        INSERT INTO commissions 
        (Title, Description, Category, Style, Size, Format, Price, ReferenceImage, Type, Customer_ID, Status, Created_At)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, 'open', NOW())
    `;

    const values = [
        title,
        description,
        category || null,
        style || null,
        size || null,
        format || null,
        price || null,
        referenceImage,
        user.id 
    ];

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({
            success: true,
            message: 'Public commission created successfully',
            commissionId: result.insertId
        });
    } catch (err) {
        console.error('Error creating public commission:', err);
        res.status(500).json({
            success: false,
            message: 'Database error while creating commission'
        });
    }
});


// 2. СТВОРЕННЯ ПРЯМОГО КОМІШЕНУ (для конкретного художника)
app.post('/api/commissions/direct/:creatorId', upload.single('referenceImage'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const creatorId = req.params.creatorId;
    const {
        title,
        description,
        category,
        style,
        size,
        format,
        price
    } = req.body;

    const referenceImage = req.file ? path.join(req.session.user.email.split('@')[0], req.file.filename) : null;

    // Валідація
    if (!title || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'Title and description are required' 
        });
    }

    // Перевірка, чи існує художник
    const checkCreatorSql = 'SELECT Creator_ID, styles FROM creators WHERE Creator_ID = ?';
    con.query(checkCreatorSql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error checking creator:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Creator not found' 
            });
        }

        // Перевірка стилю (якщо вказано)
        if (style && results[0].styles) {
            const creatorStyles = JSON.parse(results[0].styles || '[]');
            if (!creatorStyles.includes(style)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Selected style is not available for this creator' 
                });
            }
        }

        // Створення комішену
        const sql = `
            INSERT INTO commissions 
            (Title, Description, Category, Style, Size, Format, Price, ReferenceImage, Type, Customer_ID, Creator_ID, Status, Created_At)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'direct', ?, ?, 'open', NOW())
        `;

        const values = [
            title,
            description,
            category || null,
            style || null,
            size || null,
            format || null,
            price || null,
            referenceImage,
            req.session.user.id,
            creatorId
        ];

        con.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error creating direct commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error while creating commission' 
                });
            }

            res.status(201).json({ 
                success: true, 
                message: 'Direct commission created successfully',
                commissionId: result.insertId
            });
        });
    });
});

app.get('/api/commissions/public', async (req, res) => {
    // Corrected SQL for /api/commissions/public
    const sql = `
    SELECT 
        c.*,
        cr.Name as customer_name,
        cr.Email as customer_email
    FROM commissions c
    LEFT JOIN creators cr ON c.Customer_ID = cr.Creator_ID
    WHERE c.Type = 'public' AND c.Status = 'open'
    ORDER BY c.Created_At DESC
    `;


    try {
        const [results] = await db.query(sql); // Use the pool with async/await
        res.json({ 
            success: true, 
            commissions: results 
        });
    } catch (err) {
        console.error('Error fetching public commissions:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching commissions' 
        });
    }
});

// 4. ОТРИМАННЯ КОМІШЕНІВ КОНКРЕТНОГО ХУДОЖНИКА (прямі замовлення)
app.get('/api/commissions/creator/:creatorId', (req, res) => {
    const creatorId = req.params.creatorId;

    const sql = `
        SELECT 
            c.*,
            cr.Name as customer_name,
            cr.Email as customer_email
        FROM commissions c
        JOIN creators cr ON c.Customer_ID = cr.Creator_ID
        WHERE c.Creator_ID = ? AND c.Type = 'direct'
        ORDER BY c.Created_At DESC
    `;

    con.query(sql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error fetching creator commissions:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching commissions' 
            });
        }

        res.json({ 
            success: true, 
            commissions: results 
        });
    });
});

// 5. ОТРИМАННЯ КОМІШЕНІВ КОРИСТУВАЧА (замовника)
app.get('/api/commissions/my-orders', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const sql = `
        SELECT 
            c.*,
            cr.Name as creator_name,
            cr.Email as creator_email
        FROM commissions c
        LEFT JOIN creators cr ON c.Creator_ID = cr.Creator_ID
        WHERE c.Customer_ID = ?
        ORDER BY c.Created_At DESC
    `;

    con.query(sql, [req.session.user.id], (err, results) => {
        if (err) {
            console.error('Error fetching user commissions:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching commissions' 
            });
        }

        res.json({ 
            success: true, 
            commissions: results 
        });
    });
});

// 6. ВЗЯТИ ПУБЛІЧНИЙ КОМІШЕН В РОБОТУ (для художника)
app.post('/api/commissions/:id/accept', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const creatorId = req.session.user.id;

    // Перевірка, чи комішен публічний і відкритий
    const checkSql = `
        SELECT * FROM commissions 
        WHERE Commission_ID = ? AND Type = 'public' AND Status = 'open' AND Creator_ID IS NULL
    `;

    con.query(checkSql, [commissionId], (err, results) => {
        if (err) {
            console.error('Error checking commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Commission not found or already taken' 
            });
        }

        // Присвоєння художника і зміна статусу
        const updateSql = `
            UPDATE commissions 
            SET Creator_ID = ?, Status = 'in_progress', Updated_At = NOW()
            WHERE Commission_ID = ?
        `;

        con.query(updateSql, [creatorId, commissionId], (err) => {
            if (err) {
                console.error('Error accepting commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error accepting commission' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Commission accepted successfully' 
            });
        });
    });
});

// 7. ОНОВЛЕННЯ СТАТУСУ КОМІШЕНУ
app.put('/api/commissions/:id/status', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const { status } = req.body;
    const userId = req.session.user.id;

    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid status' 
        });
    }

    // Перевірка прав доступу (замовник або виконавець)
    const checkSql = `
        SELECT * FROM commissions 
        WHERE Commission_ID = ? AND (Customer_ID = ? OR Creator_ID = ?)
    `;

    con.query(checkSql, [commissionId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error checking commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const updateSql = `
            UPDATE commissions 
            SET Status = ?, Updated_At = NOW()
            WHERE Commission_ID = ?
        `;

        con.query(updateSql, [status, commissionId], (err) => {
            if (err) {
                console.error('Error updating commission status:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error updating status' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Commission status updated successfully' 
            });
        });
    });
});

// 8. ОТРИМАННЯ СТИЛІВ ХУДОЖНИКА
app.get('/api/creator/:id/styles', (req, res) => {
    const creatorId = req.params.id;

    const sql = 'SELECT styles FROM creators WHERE Creator_ID = ?';
    
    con.query(sql, [creatorId], (err, results) => {
        if (err) {
            console.error('Error fetching creator styles:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching styles' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Creator not found' 
            });
        }

        const styles = JSON.parse(results[0].styles || '[]');
        res.json({ 
            success: true, 
            styles: styles 
        });
    });
});

// 9. ОНОВЛЕННЯ СТИЛІВ ХУДОЖНИКА В ПРОФІЛІ
app.put('/api/creator/update-styles', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { styles } = req.body;
    const userId = req.session.user.id;

    if (!Array.isArray(styles)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Styles must be an array' 
        });
    }

    const sql = 'UPDATE creators SET styles = ? WHERE Creator_ID = ?';
    
    con.query(sql, [JSON.stringify(styles), userId], (err) => {
        if (err) {
            console.error('Error updating styles:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating styles' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Styles updated successfully' 
        });
    });
});

// 10. ВИДАЛЕННЯ КОМІШЕНУ
app.delete('/api/commissions/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const commissionId = req.params.id;
    const userId = req.session.user.id;

    // Спочатку отримуємо інформацію про комішен
    const selectSql = `
        SELECT ReferenceImage, Customer_ID 
        FROM commissions 
        WHERE Commission_ID = ?
    `;

    con.query(selectSql, [commissionId], (err, results) => {
        if (err) {
            console.error('Error fetching commission:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Commission not found' 
            });
        }

        // Перевірка, чи користувач є власником
        if (results[0].Customer_ID !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const imagePath = results[0].ReferenceImage;

        // Видалення з бази даних
        const deleteSql = 'DELETE FROM commissions WHERE Commission_ID = ?';
        
        con.query(deleteSql, [commissionId], (err) => {
            if (err) {
                console.error('Error deleting commission:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error deleting commission' 
                });
            }

            // Видалення файлу зображення, якщо він існує
            if (imagePath) {
                const fullPath = path.join(__dirname, 'public', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error('Error deleting reference image:', err);
                        }
                    });
                }
            }

            res.json({ 
                success: true, 
                message: 'Commission deleted successfully' 
            });
        });
    });
});