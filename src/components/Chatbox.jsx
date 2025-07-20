import React, { useState, useRef, useEffect } from "react";
import "./Chatbox.scss";

const DUMMY_MESSAGES = [
  { id: 1, content: "Xin chào! Tôi có thể giúp gì cho bạn?", role: "ai" },
  { id: 2, content: "Làm sao để tạo đề thi?", role: "user" },
  { id: 3, content: "Bạn vào mục 'Tạo đề thi' trên menu nhé!", role: "ai" },
];

const Chatbox = () => {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_KEY = "AIzaSyAWY438PG4XacWuZU8nQtQ0popo9YAVB18";

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Function gọi API Gemini
  const goiDuLieu = async (userData) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: userData }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const newUserMessage = { 
      id: Date.now(), 
      content: userMessage, 
      role: "user" 
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const aiResponse = await goiDuLieu(userMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        role: "ai"
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error in sendMessage:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        role: "ai"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbox-root">
      {open ? (
        <div className="chatbox-window">
          <div className="chatbox-header">
            <span>Chat hỗ trợ AI</span>
            <button className="chatbox-close" onClick={() => setOpen(false)}>
              &times;
            </button>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbox-message ${msg.role === "user" ? "user" : "ai"}`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="chatbox-message ai loading">
                <span>AI đang trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input-row">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbox-toggle" onClick={() => setOpen(true)}>
          💬 Chat AI
        </button>
      )}
    </div>
  );
};

export default Chatbox;