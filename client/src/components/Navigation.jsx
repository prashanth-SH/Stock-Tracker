import { useNavigate, useLocation } from "react-router-dom";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white/5 border-b border-white/10 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h1 className="text-xl font-semibold">Smart Investment Platform</h1>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className={`transition flex items-center gap-2 ${
                  isActive("/dashboard") 
                    ? "text-blue-300 font-semibold" 
                    : "text-blue-400 hover:text-blue-300"
                }`}
              >
                <span className="text-xl">📊</span>
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/watchlist")}
                className={`transition flex items-center gap-2 ${
                  isActive("/watchlist") 
                    ? "text-blue-300 font-semibold" 
                    : "text-blue-400 hover:text-blue-300"
                }`}
              >
                <span className="text-xl">⭐</span>
                <span className="font-medium">Watchlist</span>
              </button>
              <button
                onClick={() => navigate("/portfolio")}
                className={`transition flex items-center gap-2 ${
                  isActive("/portfolio") 
                    ? "text-blue-300 font-semibold" 
                    : "text-blue-400 hover:text-blue-300"
                }`}
              >
                <span className="text-xl">📈</span>
                <span className="font-medium">Portfolio</span>
              </button>
              <button
                onClick={() => navigate("/sip-calculator")}
                className={`transition flex items-center gap-2 ${
                  isActive("/sip-calculator") 
                    ? "text-blue-300 font-semibold" 
                    : "text-blue-400 hover:text-blue-300"
                }`}
              >
                <span className="text-xl">💰</span>
                <span className="font-medium">SIP Calculator</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
