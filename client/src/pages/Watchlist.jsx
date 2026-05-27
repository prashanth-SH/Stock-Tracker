import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [symbol, setSymbol] = useState("");

  // Load watchlist
  const loadWatchlist = () => {
    const saved = localStorage.getItem("userWatchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  };

  // Save watchlist
  const saveWatchlist = (list) => {
    localStorage.setItem("userWatchlist", JSON.stringify(list));
  };

  // Fetch stock prices (USES YOUR CACHE API ✅)
  const fetchStockPrices = async () => {
    try {
      if (watchlist.length === 0) return;

      setLoading(true);
      setError("");

      const res = await api.get(`/market/instruments?type=stock&limit=100`);
      const instruments = res.data.instruments || [];

      const stockMap = {};
      instruments.forEach((stock) => {
        if (watchlist.includes(stock.symbol)) {
          stockMap[stock.symbol] = stock;
        }
      });

      setStockData(stockMap);
    } catch (err) {
      console.error(err);
      setError("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED SEARCH (MAIN FIX)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    try {
      setError("");
      setLoading(true);

      const input = symbol.trim().toUpperCase();

      // ✅ USE EXISTING CACHE API
      const res = await api.get(`/market/instruments?type=stock&limit=100`);
      const instruments = res.data.instruments || [];

      // ✅ Smart search (symbol + name)
      const found = instruments.find(
        (stock) =>
          stock.symbol.toLowerCase().includes(input.toLowerCase()) ||
          stock.name.toLowerCase().includes(input.toLowerCase())
      );

      if (!found) {
        setError(`Stock "${input}" not found`);
        return;
      }

      if (watchlist.includes(found.symbol)) {
        setError("Stock already in watchlist");
        return;
      }

      const newWatchlist = [...watchlist, found.symbol];
      setWatchlist(newWatchlist);
      saveWatchlist(newWatchlist);

      setSymbol("");
    } catch (err) {
      console.error(err);
      setError("Failed to search stock");
    } finally {
      setLoading(false);
    }
  };

  // Remove stock
  const removeFromWatchlist = (stockSymbol) => {
    const newWatchlist = watchlist.filter((s) => s !== stockSymbol);
    setWatchlist(newWatchlist);
    saveWatchlist(newWatchlist);

    const newStockData = { ...stockData };
    delete newStockData[stockSymbol];
    setStockData(newStockData);
  };

  // Format helpers
  const formatCurrency = (v) =>
    `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const formatPercent = (v) =>
    `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(2)}%`;

  const getChangeColor = (v) =>
    Number(v) >= 0 ? "text-green-400" : "text-red-400";

  // Init
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    loadWatchlist();
  }, []);

  useEffect(() => {
    fetchStockPrices();
  }, [watchlist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">My Watchlist</h1>
        </div>

        {/* SEARCH */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Search stocks (RELIANCE, INFY...)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white"
            />
            <button
              className="bg-blue-600 px-6 py-3 rounded-xl"
              disabled={loading}
            >
              {loading ? "Searching..." : "Add Stock"}
            </button>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-400 mb-4">{error}</div>
        )}

        {/* WATCHLIST */}
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((symbol) => {
              const stock = stockData[symbol];

              return (
                <div key={symbol} className="bg-white/10 p-5 rounded-xl">
                  <div className="flex justify-between">
                    <h3 className="text-blue-400">{symbol}</h3>
                    <button onClick={() => removeFromWatchlist(symbol)}>
                      ❌
                    </button>
                  </div>

                  {stock ? (
                    <>
                      <p>{stock.name}</p>
                      <p>{formatCurrency(stock.currentPrice)}</p>
                      <p className={getChangeColor(stock.changePercent)}>
                        {formatPercent(stock.changePercent)}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">Loading...</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No stocks added</p>
        )}
      </div>
    </div>
  );
}

export default Watchlist;