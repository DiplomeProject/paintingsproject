import React, { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
import MessageInput from "./Messageinput";
import MessageBubble from "./MessageBubble";

const API_URL = "http://localhost:4000/api/messages";

const ChatWindow = ({ userId, receiverId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}?user=${userId}&receiver=${receiverId}`)
      .then(res => setMessages(res.data))
      .catch(console.error);
  }, [userId, receiverId]);

  useEffect(() => {
    socket.on("new_message", (msg) => {
      if (
        (msg.senderId === receiverId && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === receiverId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on("update_message_status", ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, status } : m)
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("update_message_status");
    };
  }, [userId, receiverId]);

  const sendMessage = (messageData) => {
    socket.emit("send_message", { ...messageData, senderId: userId, receiverId });
  };

  const respondToImage = (messageId, action) => {
    socket.emit("respond_image", { messageId, action });
  };

  return (
    <div className="w-[400px] bg-white shadow-lg rounded-2xl flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            userId={userId}
            onRespond={respondToImage}
          />
        ))}
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;