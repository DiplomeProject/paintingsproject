import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { initDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let db;

// 🔹 REST: Получить историю сообщений
app.get("/api/messages", async (req, res) => {
  const { user, receiver } = req.query;
  const rows = await db.all(
    `SELECT * FROM messages 
     WHERE (senderId = ? AND receiverId = ?) 
        OR (senderId = ? AND receiverId = ?) 
     ORDER BY timestamp ASC`,
    [user, receiver, receiver, user]
  );
  res.json(rows);
});

// 🔹 WebSocket логика
io.on("connection", (socket) => {
  console.log("✅ Новый пользователь подключен");

  // 📩 Отправка сообщения
  socket.on("send_message", async (msg) => {
    const message = {
      id: uuidv4(),
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      type: msg.type,
      content: msg.content,
      status: msg.type === "image" ? "pending_approval" : "delivered",
      timestamp: new Date().toISOString(),
    };

    await db.run(
      `INSERT INTO messages (id, senderId, receiverId, type, content, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.senderId,
        message.receiverId,
        message.type,
        message.content,
        message.status,
        message.timestamp,
      ]
    );

    // Отправляем получателю
    io.emit("new_message", message);
  });

  // 📤 Ответ на изображение (принятие/отклонение)
  socket.on("respond_image", async ({ messageId, action }) => {
    const status = action === "approve" ? "approved" : "rejected";
    await db.run(`UPDATE messages SET status = ? WHERE id = ?`, [status, messageId]);

    io.emit("update_message_status", { messageId, status });
  });

  socket.on("disconnect", () => {
    console.log("❌ Пользователь отключился");
  });
});

// 🔹 Запуск
const start = async () => {
  db = await initDB();
  httpServer.listen(4000, () => console.log("🚀 Сервер запущен на http://localhost:4000"));
};

start();
