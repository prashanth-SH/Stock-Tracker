import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState("");

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await api.get("/watchlist");
      setWatchlist(res.data);
    } catch {
      setError("Failed to load watchlist. Please refresh.");
    }
  };

  // Fetch price for ONE stock
  const fetchPrice = async (stock) => {
    try {
      const res = await api.get(`/stocks/${stock}`);
      return res.data;
    } catch {
      return null;
    }
  };

  // Fetch prices for ALL stocks (rate-limit safe)
  const fetchAllPrices = async (stocks) => {
    setLoadingPrices(true);
    const results = {};

    for (const stock of stocks) {
      // Do not refetch if already available
      if (!prices[stock]) {
        const data = await fetchPrice(stock);
        if (data) {
          results[stock] = data;
        }
      }
    }

    setPrices((prev) => ({ ...prev, ...results }));
    setLoadingPrices(false);
  };

  // Initial load
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Load prices when watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      fetchAllPrices(watchlist);
    } else {
      setPrices({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  // Add stock
  const addStock = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    try {
      await api.post("/watchlist", { symbol });
      setSymbol("");
      fetchWatchlist();
    } catch {
      setError("Could not add stock. Please try again.");
    }
  };

  // Remove stock
  const removeStock = async (stock) => {
    try {
      await api.delete(`/watchlist/${stock}`);
      setPrices((prev) => {
        const updated = { ...prev };
        delete updated[stock];
        return updated;
      });
      fetchWatchlist();
    } catch {
      setError("Could not remove stock. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const formatCurrency = (value) =>
    typeof value === "number" ? value.toFixed(2) : value;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">
              Stock Tracker
            </p>
            <h1 className="text-3xl font-semibold mt-1">Your Watchlist</h1>
            <p className="text-sm text-slate-400">
              Track prices in real-time and manage your symbols.
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-red-500/30"
          >
            <span className="text-lg">⎋</span> Logout
          </button>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold">Watchlist</h2>
              {loadingPrices && (
                <span className="text-sm text-blue-200 flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-blue-200/60 border-t-transparent rounded-full animate-spin" />
                  Updating prices...
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {watchlist.length === 0 ? (
              <div className="text-center text-slate-400 py-12 border border-dashed border-white/10 rounded-xl">
                <p className="text-lg">Your watchlist is empty 📭</p>
                <p className="text-sm mt-1">
                  Add a stock symbol to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-4 bg-white/5 text-xs uppercase tracking-wide text-slate-300 px-4 py-3">
                  <span>Symbol</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Change</span>
                  <span className="text-right">Action</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {watchlist.map((stock) => {
                    const priceData = prices[stock];
                    const isDown =
                      priceData?.change &&
                      typeof priceData.change === "string" &&
                      priceData.change.startsWith("-");

                    return (
                      <li
                        key={stock}
                        className="grid grid-cols-4 items-center px-4 py-4 hover:bg-white/5 transition"
                      >
                        <div className="font-semibold text-lg">{stock}</div>

                        <div className="text-right font-medium">
                          {priceData ? (
                            `$${formatCurrency(priceData.price)}`
                          ) : (
                            <span className="text-slate-400">Loading...</span>
                          )}
                        </div>

                        <div
                          className={`text-right text-sm font-semibold ${
                            isDown ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {priceData ? priceData.changePercent : "—"}
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() => removeStock(stock)}
                            className="inline-flex items-center gap-2 text-sm text-slate-200 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400 px-3 py-2 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Add stock card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur h-fit">
            <h3 className="text-lg font-semibold mb-2">Add a stock</h3>
            <p className="text-sm text-slate-400 mb-4">
              Enter a ticker symbol to add it to your watchlist.
            </p>
            <form onSubmit={addStock} className="space-y-3">
              <input
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="e.g. AAPL, MSFT, TSLA"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-emerald-500/30"
              >
                Add to watchlist
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Real-time price checks
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Quick add & remove
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Responsive layout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
