const express = require('express');
const db = require('../config/db');
const { uploadMemory } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-profile', auth, uploadMemory.single('profileImage'), async (req, res) => {
    const userId = req.session.user?.Creator_ID || req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Отримуємо з'єднання для транзакції
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Розбираємо вхідні дані
        const { username, email, description, instagram, behance, tiktok, styleTags, languageTags } = req.body;

        // Парсимо JSON рядки з масивами
        let parsedStyles = [];
        let parsedLanguages = [];
        try {
            if (styleTags) parsedStyles = JSON.parse(styleTags);
            if (languageTags) parsedLanguages = JSON.parse(languageTags);
        } catch (e) {
            console.error("Error parsing tags:", e);
        }

        // 2. Перевірка унікальності (Name/Email), виключаючи поточного юзера
        const [existingUsers] = await connection.query(
            `SELECT Creator_ID, Name, Email FROM creators 
       WHERE (Name = ? OR Email = ?) AND Creator_ID != ?`,
            [username, email, userId]
        );

        if (existingUsers.length > 0) {
            const conflict = existingUsers[0];
            await connection.rollback(); // Відміна транзакції
            if (conflict.Name === username) {
                return res.status(409).json({ success: false, message: 'This username is already taken.' });
            }
            return res.status(409).json({ success: false, message: 'This email is already registered.' });
        }

        // 3. Отримання поточних даних (для "м'якого" оновлення)
        const [currentUserResult] = await connection.query('SELECT * FROM creators WHERE Creator_ID = ?', [userId]);
        const currentUser = currentUserResult[0];

        if (!currentUser) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Логіка: якщо прийшло пусте значення - лишаємо старе
        const finalName = username && username.trim() !== '' ? username : currentUser.Name;
        const finalEmail = email && email.trim() !== '' ? email : currentUser.Email;
        const finalBio = description !== undefined ? description : currentUser.Other_Details;

        // Соцмережі (допускаємо пусті рядки, якщо користувач стер посилання)
        const finalInsta = instagram !== undefined ? instagram : currentUser.Instagram;
        const finalBehance = behance !== undefined ? behance : currentUser.Behance;
        const finalTikTok = tiktok !== undefined ? tiktok : currentUser.TikTok;

        // Картинка
        const finalImage = req.file ? req.file.buffer : currentUser.Image;

        // 4. Оновлення основної таблиці creators
        await connection.query(
            `UPDATE creators 
       SET Name = ?, Email = ?, Other_Details = ?, Instagram = ?, Behance = ?, TikTok = ?, Image = ?
       WHERE Creator_ID = ?`,
            [finalName, finalEmail, finalBio, finalInsta, finalBehance, finalTikTok, finalImage, userId]
        );

        // 5. Оновлення СТИЛІВ (Таблиця creator_styles)
        if (parsedStyles.length >= 0) { // Якщо масив прийшов (навіть пустий) - оновлюємо
            // А. Видаляємо старі
            await connection.query('DELETE FROM creator_styles WHERE Creator_ID = ?', [userId]);

            // Б. Якщо є нові - додаємо
            if (parsedStyles.length > 0) {
                // Знаходимо ID цих стилів за назвами
                const [stylesInDb] = await connection.query(
                    'SELECT Style_ID FROM styles WHERE Name IN (?)',
                    [parsedStyles]
                );

                if (stylesInDb.length > 0) {
                    const styleValues = stylesInDb.map(s => [userId, s.Style_ID]);
                    await connection.query(
                        'INSERT INTO creator_styles (Creator_ID, Style_ID) VALUES ?',
                        [styleValues]
                    );
                }
            }
        }

        // 6. Оновлення МОВ (Таблиця creator_languages)
        if (parsedLanguages.length >= 0) {
            await connection.query('DELETE FROM creator_languages WHERE Creator_ID = ?', [userId]);

            if (parsedLanguages.length > 0) {
                const [langsInDb] = await connection.query(
                    'SELECT Language_ID FROM languages WHERE Name IN (?)',
                    [parsedLanguages]
                );

                if (langsInDb.length > 0) {
                    const langValues = langsInDb.map(l => [userId, l.Language_ID]);
                    await connection.query(
                        'INSERT INTO creator_languages (Creator_ID, Language_ID) VALUES ?',
                        [langValues]
                    );
                }
            }
        }

        await connection.commit();

        // 7. Оновлення сесії
        const profileImageBase64 = Buffer.isBuffer(finalImage)
            ? `data:image/jpeg;base64,${finalImage.toString('base64')}`
            : null;

        req.session.user = {
            ...req.session.user,
            name: finalName,
            email: finalEmail,
            bio: finalBio,
            instagram: finalInsta,
            behance: finalBehance,
            tiktok: finalTikTok,
            styles: parsedStyles,
            languages: parsedLanguages,
            profileImage: profileImageBase64
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: req.session.user
        });

    } catch (err) {
        await connection.rollback();
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    } finally {
        connection.release();
    }
});



router.get('/getuserpaintings', auth, async (req, res) => {
  const userId = req.session.user?.Creator_ID || req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  try {
    const [rows] = await db.query(
      `SELECT Painting_ID AS id, Title AS title, Image AS image_blob, Description AS description, Price AS price, Style AS style 
       FROM paintings 
       WHERE Creator_ID = ?`,
      [userId]
    );

    const paintings = rows.map((row) => {
      const blob = row.image_blob;
      const image_url = blob
        ? `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}`
        : null;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        style: row.style,
        image_url,
      };
    });

    res.json({
      success: true,
      paintings,
    });
  } catch (err) {
    console.error('Error fetching user paintings:', err);
    res.status(500).json({ success: false, message: 'Error fetching user paintings' });
  }
});



   

module.exports = router;