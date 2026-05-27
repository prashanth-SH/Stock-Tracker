import { useState, useEffect, useRef } from "react";
import api from "../services/api";

// Get portfolio data from localStorage
const getPortfolioData = () => {
  try {
    return JSON.parse(localStorage.getItem("portfolio") || "[]");
  } catch {
    return [];
  }
};

function Chatbot({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const portfolioData = getPortfolioData();
      const enhancedMessage = `
User Query: ${inputMessage}
User Portfolio: ${JSON.stringify(portfolioData)}
Give personalized financial advice.
`;

      const response = await api.post("/chatbot/query", {
        message: enhancedMessage,
        portfolio: portfolioData
      });

      setTimeout(() => {
        const botMessage = {
          text: response.data.text,
          sender: "bot",
          timestamp: new Date(),
          followUpQuestions: generateDynamicSuggestions(response.data.text)
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          text: "Something went wrong. Try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const generateDynamicSuggestions = (text) => {
    const suggestions = [];

    if (text.toLowerCase().includes("risk")) {
      suggestions.push("Show low risk stocks", "How to reduce risk?");
    }

    if (text.includes("₹") || text.includes("k")) {
      suggestions.push("Best allocation plan", "Short term vs long term?");
    }

    if (text.toLowerCase().includes("stock")) {
      suggestions.push("Top stocks today", "Should I diversify?");
    }

    if (text.toLowerCase().includes("portfolio")) {
      suggestions.push("Analyze my portfolio", "How to improve returns?");
    }

    return suggestions.length > 0
      ? suggestions
      : ["What should I invest in?", "Suggest a plan for me"];
  };

  const handleQuickAction = (q) => {
    setInputMessage(q);
    setTimeout(sendMessage, 100);
  };

  const formatResponse = (text) => {
    const lines = text.split("\n");

    return lines.map((line, index) => {
      if (line.toLowerCase().includes("advice")) {
        return (
          <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
            💡 <span className="font-semibold">Advice:</span> {line.replace(/advice:/i, "")}
          </div>
        );
      }

      if (line.toLowerCase().includes("recommendation")) {
        return (
          <div key={index} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-2">
            ✅ <span className="font-semibold">Recommendation:</span> {line.replace(/recommendation:/i, "")}
          </div>
        );
      }

      if (line.toLowerCase().includes("example stocks")) {
        return (
          <div key={index} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-2">
            📈 <span className="font-semibold">Example Stocks:</span> {line.replace(/example stocks:/i, "")}
          </div>
        );
      }

      if (line.toLowerCase().includes("next step")) {
        return (
          <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-2">
            👉 <span className="font-semibold">Next Step:</span> {line.replace(/next step:/i, "")}
          </div>
        );
      }

      if (line.toLowerCase().includes("risk")) {
        return (
          <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-2">
            ⚠️ <span className="font-semibold">Risk:</span> {line.replace(/risk:/i, "")}
          </div>
        );
      }

      if (line.toLowerCase().includes("allocation")) {
        return (
          <div key={index} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-2">
            📊 <span className="font-semibold">Allocation:</span> {line.replace(/allocation:/i, "")}
          </div>
        );
      }

      return line.trim() ? <p key={index} className="text-sm text-gray-700 mb-2">{line}</p> : null;
    });
  };

  return (
    <>
      {/* FLOAT BUTTON (hidden when open) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:scale-110 transition"
        >
          💬
        </button>
      )}

      {/* CHAT PANEL */}
      {isOpen && (
        <div className="h-full flex flex-col bg-white rounded-l-2xl shadow-2xl">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-tl-2xl flex justify-between items-center">
            <h3 className="font-semibold">AI Financial Advisor</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "p-3 rounded-xl bg-white text-gray-800 border shadow-sm max-w-[80%]"
                  }`}
                >
                  {m.sender === "bot" ? formatResponse(m.text) : m.text}
                  
                  {/* Quick action buttons */}
                  {m.sender === "bot" && m.followUpQuestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.followUpQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(q)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Enhanced typing animation */}
            {isTyping && (
              <div className="text-gray-500 italic animate-pulse">
                AI is analyzing your financial data...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              className="flex-1 border rounded-xl px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;