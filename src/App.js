import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [currentUser, setCurrentUser] = useState("user1");
  const [receiver, setReceiver] = useState("user2");

  const switchUser = () => {
    setCurrentUser(currentUser === "user1" ? "user2" : "user1");
    setReceiver(currentUser === "user1" ? "user1" : "user2");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">💬 Chat Demo</h1>

      <div className="mb-4">
        <p className="mb-2">Текущий пользователь: <strong>{currentUser}</strong></p>
        <button
          onClick={switchUser}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Переключить пользователя
        </button>
      </div>

      <ChatWindow userId={currentUser} receiverId={receiver} />
    </div>
  );
}

export default App;
