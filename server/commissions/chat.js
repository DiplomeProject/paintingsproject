const express = require('express');
const db = require('../config/db');

const router = express.Router();

function detectImageMime(buffer) {
  if (!buffer || buffer.length < 4) return 'image/png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  return 'image/png';
}
// Get messages for a commission
// GET /api/commissions/chat/:commissionId/messages?limit=100
router.get('/:commissionId/messages', async (req, res) => {
  const { commissionId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 1000;

  try {
    const [rows] = await db.query(
      'SELECT id, senderId, receiverId, commissionId, type, content, image, status, timestamp FROM messages WHERE commissionId = ? ORDER BY timestamp ASC LIMIT ?'
      , [commissionId, limit]
    );

    // convert image buffers to data URIs when present
    const mapped = rows.map(r => {
      let image = null;
      if (r.image) {
        try {
          const mime = detectImageMime(r.image);
          image = `data:${mime};base64,${Buffer.from(r.image).toString('base64')}`;
        } catch (e) {
          image = null;
        }
      }

      // If content is null/empty (or the literal string 'null') but we have an image, stamp the image into content
      let outContent = r.content;
      let outType = r.type;
      const contentStr = outContent === null || outContent === undefined ? '' : String(outContent).trim();
      const isLiteralNull = contentStr.toLowerCase() === 'null';
      if ((contentStr === '' || isLiteralNull) && image) {
        outContent = image;
        outType = 'image';
      }

      return {
        id: r.id,
        senderId: r.senderId,
        receiverId: r.receiverId,
        commissionId: r.commissionId,
        type: outType,
        content: outContent,
        image,
        status: r.status,
        timestamp: r.timestamp
      };
    });

    res.json({ success: true, messages: mapped });
  } catch (err) {
    console.error('[chat] GET messages error:', err);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

// Send a message
// POST /api/commissions/chat/:commissionId/messages
// body: { senderId, receiverId, type, content }
// POST /api/commissions/chat/:commissionId/messages
router.post('/:commissionId/messages', async (req, res) => {
  const { commissionId } = req.params;
  const { type = 'text', content } = req.body;

  // 1. Session check
  if (!req.session?.user?.id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const senderId = Number(req.session.user.id);

  try {
    console.log(`[chat] POST /${commissionId}/messages — sender=${senderId} type=${type} contentLen=${String(content || '').length}`);
    // 2. Fetch the commission to find the creator and customer
    const [commRows] = await db.query(
      'SELECT Creator_ID, Customer_ID FROM commissions WHERE Commission_ID = ?',
      [commissionId]
    );

    console.log('[chat] commission rows:', commRows && commRows.length, commRows && commRows[0]);

    if (!commRows || commRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Commission not found' });
    }

    const creatorId = Number(commRows[0].Creator_ID);
    const customerId = Number(commRows[0].Customer_ID);

    // 3. Determine who gets the message
    let receiverId = null;
    if (senderId === creatorId) receiverId = customerId;
    else if (senderId === customerId) receiverId = creatorId;
    else return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this commission' });

    // 4. Insert message (Letting MySQL handle the AUTO_INCREMENT ID and TIMESTAMP)
      if (!receiverId) return res.status(400).json({ success: false, message: 'No receiver for this commission' });

      console.log('[chat] inserting message: receiverId=', receiverId, 'type=', type);

      // If it's an image message, convert data URI to binary for storage in `image` column
      if (type === 'image' && typeof content === 'string' && content.startsWith('data:')) {
        const commaIndex = content.indexOf(',');
        const base64 = content.substring(commaIndex + 1);
        const buffer = Buffer.from(base64, 'base64');

        const [result] = await db.query(
          'INSERT INTO messages (senderId, receiverId, commissionId, type, content, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [senderId, receiverId, commissionId, type, null, buffer, 'unread']
        );
        console.log('[chat] insert result:', result && { insertId: result.insertId, affectedRows: result.affectedRows });

        const [newMsgRows] = await db.query('SELECT id, senderId, receiverId, commissionId, type, content, image, status, timestamp FROM messages WHERE id = ?', [result.insertId]);
        const row = newMsgRows[0];
        let imageUri = null;
        if (row.image) {
          const mime = detectImageMime(row.image);
          imageUri = `data:${mime};base64,${Buffer.from(row.image).toString('base64')}`;
        }
          const out = { id: row.id, senderId: row.senderId, receiverId: row.receiverId, commissionId: row.commissionId, type: row.type, content: row.content, image: imageUri, status: row.status, timestamp: row.timestamp };
          // emit realtime event to room
          try {
            const { getIO } = require('../socket');
            const io = getIO();
            io.to(`commission_${commissionId}`).emit('newMessage', out);
          } catch (e) {
            console.warn('[chat] socket emit failed:', e.message);
          }
          res.status(201).json({ success: true, message: out });
        return;
      }

      // non-image messages (text)
      const [result] = await db.query(
        'INSERT INTO messages (senderId, receiverId, commissionId, type, content, status) VALUES (?, ?, ?, ?, ?, ?)',
        [senderId, receiverId, commissionId, type, content, 'unread']
      );
      console.log('[chat] insert result:', result && { insertId: result.insertId, affectedRows: result.affectedRows });

      const [newMsgRows] = await db.query('SELECT id, senderId, receiverId, commissionId, type, content, image, status, timestamp FROM messages WHERE id = ?', [result.insertId]);
      const row = newMsgRows[0];
      const out = { id: row.id, senderId: row.senderId, receiverId: row.receiverId, commissionId: row.commissionId, type: row.type, content: row.content, image: null, status: row.status, timestamp: row.timestamp };
      try {
        const { getIO } = require('../socket');
        const io = getIO();
        io.to(`commission_${commissionId}`).emit('newMessage', out);
      } catch (e) {
        console.warn('[chat] socket emit failed:', e.message);
      }
      res.status(201).json({ success: true, message: out });
  } catch (err) {
    console.error('[chat] INSERT ERROR:', err); // Check your terminal for this log
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Mark a message as read
// PATCH /api/commissions/chat/:commissionId/messages/:id/read
router.patch('/:commissionId/messages/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('UPDATE messages SET status = ? WHERE id = ?', ['read', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[chat] PATCH read error:', err);
    res.status(500).json({ success: false, message: 'Error updating message' });
  }
});

// Unread count for a user (optionally filtered by commission)
// GET /api/commissions/chat/unread-count/:userId?commissionId=123
router.get('/unread-count/:userId', async (req, res) => {
  const { userId } = req.params;
  const { commissionId } = req.query;

  try {
    let sql = 'SELECT COUNT(*) AS cnt FROM messages WHERE receiverId = ? AND status = ?';
    const params = [userId, 'unread'];

    if (commissionId) {
      sql += ' AND commissionId = ?';
      params.push(commissionId);
    }

    const [rows] = await db.query(sql, params);
    res.json({ success: true, unread: rows[0].cnt });
  } catch (err) {
    console.error('[chat] GET unread-count error:', err);
    res.status(500).json({ success: false, message: 'Error getting unread count' });
  }
});

module.exports = router;
