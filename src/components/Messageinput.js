import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSend = () => {
    if (imageFile) {
      const imgUrl = URL.createObjectURL(imageFile);
      onSend({ type: "image", content: imgUrl });
      setImageFile(null);
    } else if (text.trim()) {
      onSend({ type: "text", content: text });
      setText("");
    }
  };

  return (
    <div className="flex items-center p-2 border-t bg-white">
      <input
        type="text"
        placeholder="Введите сообщение..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded-lg p-2 mr-2"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="mr-2"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;