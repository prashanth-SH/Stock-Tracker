import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import SipCalculator from "./pages/SipCalculator";

import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot";

function LayoutWrapper() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" || location.pathname === "/signup";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* MAIN CONTENT */}
      <div
        className={`transition-all duration-300 overflow-y-auto ${
          chatOpen ? "w-[70%]" : "w-full"
        } mx-auto`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sip-calculator"
            element={
              <ProtectedRoute>
                <SipCalculator />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* CHAT PANEL */}
      {!isAuthPage && (
        <div
          style={{ width: chatOpen ? "30%" : "0%" }}
          className="transition-all duration-300 overflow-hidden"
        >
          <Chatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;