import React from "react";

const MessageBubble = ({ msg, userId, onRespond }) => {
  const isMine = msg.senderId === userId;

  const renderContent = () => {
    if (msg.type === "text") return <p>{msg.content}</p>;

    if (msg.type === "image") {
      if (msg.status === "pending_approval" && !isMine) {
        return (
          <div className="flex flex-col items-center">
            <img
              src={msg.content}
              alt="pending"
              className="w-[200px] h-[200px] object-cover rounded-lg mb-2"
            />
            <div className="flex space-x-2">
              <button
            onClick={() => onRespond(msg.id, "approve")}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
            ✅ Принять
              </button>
              <button
            onClick={() => onRespond(msg.id, "reject")}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
            ❌ Отклонить
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center">
          <img
            src={msg.content}
            alt="img"
            className={`w-40 h-40 object-cover rounded-lg ${
              msg.status === "rejected" ? "opacity-50" : ""
            }`}
          />
          <div className="mt-1 text-sm flex items-center space-x-1">
            {msg.status === "approved" && (
              <>
                <span>Принято</span>
              </>
            )}
            {msg.status === "rejected" && (
              <>
                 <span>Отклонено</span>
              </>
            )}
            {msg.status === "pending_approval" && isMine && (
              <span className="text-gray-400 italic">Ожидает ответа...</span>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`my-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-xl px-3 py-2 ${
          isMine ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MessageBubble;