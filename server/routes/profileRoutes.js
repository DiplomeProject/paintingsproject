const express = require('express');
const db = require('../config/db');
const { uploadMemory } = require('../config/multerConfig');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-profile', auth, uploadMemory.single('profileImage'), async (req, res) => {
    // 1. Отримуємо ID користувача
    const userId = req.session.user?.Creator_ID || req.session.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
        // 2. Отримуємо дані з фронтенду
        const { username, email, description, instagram, behance, tiktok, styleTags, languageTags } = req.body;

        // 3. Перевіряємо, чи не зайнятий email/username кимось іншим
        const [existingUsers] = await db.query(
            `SELECT Creator_ID, Name, Email FROM creators 
             WHERE (Name = ? OR Email = ?) AND Creator_ID != ?`,
            [username, email, userId]
        );

        if (existingUsers.length > 0) {
            const conflict = existingUsers[0];
            if (conflict.Name === username) {
                return res.status(409).json({ success: false, message: 'This username is already taken.' });
            }
            return res.status(409).json({ success: false, message: 'This email is already registered.' });
        }

        // 4. Отримуємо поточні дані користувача (щоб не стерти те, що не прийшло)
        const [currentUserResult] = await db.query('SELECT * FROM creators WHERE Creator_ID = ?', [userId]);
        const currentUser = currentUserResult[0];

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Підготовка даних для запису
        const finalName = username && username.trim() !== '' ? username : currentUser.Name;
        const finalEmail = email && email.trim() !== '' ? email : currentUser.Email;
        const finalBio = description !== undefined ? description : currentUser.Other_Details;

        const finalInsta = instagram !== undefined ? instagram : currentUser.Instagram;
        const finalBehance = behance !== undefined ? behance : currentUser.Behance;
        const finalTikTok = tiktok !== undefined ? tiktok : currentUser.TikTok;

        // Обробка картинки
        const finalImage = req.file ? req.file.buffer : currentUser.Image;

        // ПРОСТЕ ЗБЕРЕЖЕННЯ СТИЛІВ ТА МОВ
        // Фронтенд надсилає їх як рядок '["Retro", "Realism"]', ми так і записуємо в БД.
        // Якщо прийшло undefined, залишаємо старе значення.
        const finalStyles = styleTags ? styleTags : currentUser.styles;
        const finalLanguages = languageTags ? languageTags : currentUser.languages;

        // 5. Оновлюємо таблицю (ОДИН простий запит)
        await db.query(
            `UPDATE creators
             SET Name = ?, Email = ?, Other_Details = ?,
                 Instagram = ?, Behance = ?, TikTok = ?,
                 Image = ?, styles = ?, languages = ?
             WHERE Creator_ID = ?`,
            [
                finalName, finalEmail, finalBio,
                finalInsta, finalBehance, finalTikTok,
                finalImage, finalStyles, finalLanguages,
                userId
            ]
        );

        // 6. Оновлюємо сесію, щоб фронтенд одразу побачив зміни
        let parsedStylesArray = [];
        let parsedLanguagesArray = [];

        try {
            // Намагаємось розпарсити JSON рядки назад у масиви для сесії
            if (finalStyles) parsedStylesArray = JSON.parse(finalStyles);
            if (finalLanguages) parsedLanguagesArray = JSON.parse(finalLanguages);
        } catch (e) {
            console.error("Error parsing JSON for session:", e);
        }

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
            styles: parsedStylesArray,     // У сесію кладемо масив
            languages: parsedLanguagesArray, // У сесію кладемо масив
            profileImage: profileImageBase64
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: req.session.user
        });

    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// Роут для картин, він не змінювався, але лишаємо його тут
router.get('/getuserpaintings', auth, async (req, res) => {
    const userId = req.session.user?.Creator_ID || req.session.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    try {
        const [rows] = await db.query(
            `SELECT Painting_ID AS id, Title AS title, Image AS image_blob, Description AS description, Price AS price, Style AS style
             FROM paintings WHERE Creator_ID = ?`,
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

        res.json({ success: true, paintings });
    } catch (err) {
        console.error('Error fetching user paintings:', err);
        res.status(500).json({ success: false, message: 'Error fetching user paintings' });
    }
});

module.exports = router;