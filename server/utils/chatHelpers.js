// Utility helpers for chat routes

function detectImageMime(buffer) {
  if (!buffer || buffer.length < 4) return 'image/png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  return 'image/png';
}

function rowToMessage(row) {
  let image = null;
  if (row.image) {
    try {
      const mime = detectImageMime(row.image);
      image = `data:${mime};base64,${Buffer.from(row.image).toString('base64')}`;
    } catch (e) {
      image = null;
    }
  }

  // Normalize empty content for image messages
  let outContent = row.content;
  let outType = row.type;
  const contentStr = outContent === null || outContent === undefined ? '' : String(outContent).trim();
  const isLiteralNull = contentStr.toLowerCase() === 'null';
  if ((contentStr === '' || isLiteralNull) && image) {
    outContent = image;
    outType = 'image';
  }

  return {
    id: row.id,
    senderId: row.senderId,
    receiverId: row.receiverId,
    commissionId: row.commissionId,
    type: outType,
    content: outContent,
    image,
    status: row.status,
    timestamp: row.timestamp
  };
}

module.exports = { detectImageMime, rowToMessage };
