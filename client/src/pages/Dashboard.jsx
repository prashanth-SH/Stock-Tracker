import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Navigation from "../components/Navigation";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [topFDs, setTopFDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [error, setError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Base Stock Data (static)
  const baseStocks = [
    { name: "Reliance Industries", symbol: "RELIANCE", basePrice: 2850 },
    { name: "TCS", symbol: "TCS", basePrice: 3950 },
    { name: "Infosys", symbol: "INFY", basePrice: 1500 },
    { name: "HDFC Bank", symbol: "HDFCBANK", basePrice: 1650 }
  ];

  // Random Price Generator
  const generateDynamicStocks = () => {
    return baseStocks.map((stock) => {
      const variation = (Math.random() - 0.5) * 50; // random fluctuation
      const price = Math.round(stock.basePrice + variation);

      const changePercent = ((variation / stock.basePrice) * 100).toFixed(2);

      return {
        name: stock.name,
        symbol: stock.symbol,
        price,
        change: `${changePercent}%` 
      };
    });
  };

  const [dynamicStocks, setDynamicStocks] = useState(generateDynamicStocks());

  // Fetch market overview
  const fetchMarketOverview = async () => {
    try {
      const res = await api.get("/market/overview");
      setTopStocks(res.data.topStocks);
      setTopFDs(res.data.topFDs);
    } catch (err) {
      setError("Unable to fetch latest data. Please try refreshing.");
    }
  };

  // Fetch all instruments
  const fetchInstruments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType !== "all") params.append("type", selectedType);
      
      const res = await api.get(`/market/instruments?${params}`);
      setMarketData(res.data.instruments || []);
      setLastUpdated(new Date());
      setDynamicStocks(generateDynamicStocks());

      // Check price alerts
      const alerts = JSON.parse(localStorage.getItem("alerts") || "[]");

      alerts.forEach((alert) => {
        const stock = res.data.instruments?.find(
          (s) => s.symbol === alert.symbol
        );

        if (stock && stock.currentPrice >= alert.price) {
          toast(`🚨 ${alert.symbol} reached ₹${alert.price}`, {
            icon: "📈",
          });
        }
      });
    } catch (err) {
      setError("Failed to load instruments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketOverview();
    fetchInstruments();

    const interval = setInterval(() => {
      fetchInstruments();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, []);

  // Auto-update fallback every 5 seconds when API fails
  useEffect(() => {
    if (!topStocks || topStocks.length === 0) {
      const interval = setInterval(() => {
        setDynamicStocks(generateDynamicStocks());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [topStocks]);

  useEffect(() => {
    if (searchTerm || selectedType !== "all") {
      fetchInstruments();
    }
  }, [searchTerm, selectedType]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Add stock to watchlist
  const addToWatchlist = async (symbol) => {
    try {
      // Get current watchlist from localStorage
      const saved = localStorage.getItem("userWatchlist");
      const watchlist = saved ? JSON.parse(saved) : [];
      
      // Check if already in watchlist
      if (watchlist.includes(symbol)) {
        console.log(`${symbol} is already in watchlist`);
        return;
      }
      
      // Add to watchlist immediately
      const newWatchlist = [...watchlist, symbol];
      localStorage.setItem("userWatchlist", JSON.stringify(newWatchlist));
      console.log(`Added ${symbol} to watchlist`);
      
      // Try to fetch stock data if not in cache
      try {
        const res = await api.get(`/market/instruments?type=stock&limit=100`);
        const instruments = res.data.instruments || [];
        const existingStock = instruments.find(stock => stock.symbol === symbol);
        
        if (!existingStock) {
          // Stock not in cache, fetch from API
          await api.post("/stocks/add", { symbol });
          console.log(`Fetched ${symbol} from API and added to cache`);
        }
      } catch (error) {
        console.log(`Could not fetch ${symbol} from API, but added to watchlist`);
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
    }
  };

  // Price Alerts functionality
  const setAlert = (symbol) => {
    const price = prompt(`Enter target price for ${symbol}`);
    if (!price) return;

    const alerts = JSON.parse(localStorage.getItem("alerts") || "[]");
    alerts.push({ symbol, price: Number(price) });

    localStorage.setItem("alerts", JSON.stringify(alerts));
    toast.success("Alert saved!");
  };

  // Search for stocks dynamically
  const searchStocks = async (query) => {
    if (!query.trim()) {
      fetchInstruments();
      return;
    }

    setSearchLoading(true);
    setError("");

    try {
      // First search in existing cache
      const res = await api.get(`/market/instruments?type=stock&limit=100`);
      const instruments = res.data.instruments || [];
      
      // Filter existing stocks
      const matches = instruments.filter(stock => 
        (stock.symbol || "").toLowerCase().includes(query.toLowerCase()) ||
        (stock.name || "").toLowerCase().includes(query.toLowerCase())
      );

      // Store top 5 matches in suggestions
      setSuggestions(matches.slice(0, 5));
      setMarketData(matches);

      // Clear suggestions when input is empty
      if (!query) {
        setSuggestions([]);
      }

      // Check if we have exact symbol match
      const exactMatch = instruments.find(stock => 
        stock.symbol.toLowerCase() === query.toLowerCase()
      );

      if (exactMatch) {
        // Found in cache, show results
        setMarketData(matches);
      } else {
        // Not found in cache, try to fetch from API
        try {
          const addRes = await api.post("/stocks/add", { symbol: query.toUpperCase() });
          const newStock = addRes.data.stock;
          
          // Add to results
          // const updatedResults = [...existingMatches, newStock];
          const updatedResults = [...matches, newStock];
          setMarketData(updatedResults);
          
          console.log(`Fetched ${query} from API and added to cache`);
        } catch (error) {
          // Stock not found or API error
          if (matches.length === 0) {
            setError(`No results found for "${query}". Try searching for popular stocks like RELIANCE, TCS, or AAPL.`);
          } else {
            setMarketData(matches);
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search stocks");
    } finally {
      setSearchLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `₹${value.toLocaleString()}`;
    }
    return value;
  };

  const formatChange = (change) => {
    if (typeof change === "number") {
      return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    }
    return change;
  };

  // Helper function to get change color
  const getChangeColor = (change) => {
    if (typeof change === 'string') {
      return change.includes('+') ? 'text-green-400' : 'text-red-400';
    }
    if (typeof change === 'number') {
      return change >= 0 ? 'text-green-400' : 'text-red-400';
    }
    return 'text-gray-400';
  };

  // Mock FD Data
  const mockFDs = [
    {
      bank: "HDFC Bank",
      duration: "1 Year",
      rate: 6.8,
      minAmount: 1000
    },
    {
      bank: "ICICI Bank",
      duration: "2 Years",
      rate: 7.1,
      minAmount: 5000
    },
    {
      bank: "SBI",
      duration: "3 Years",
      rate: 6.5,
      minAmount: 1000
    },
    {
      bank: "Axis Bank",
      duration: "5 Years",
      rate: 7.2,
      minAmount: 5000
    }
  ];

  // Safe data source for stocks
  const displayStocks =
    topStocks && topStocks.length > 0
      ? topStocks
      : dynamicStocks;

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
  <Navigation />
      
      <div className="w-full max-w-[1400px] mx-auto px-4 py-8 transition-all duration-300">
        {/* Market Ticker */}
        <div className="overflow-hidden whitespace-nowrap mb-4">
          <div className="animate-marquee inline-block text-green-400">
            RELIANCE ▲ +1.2% &nbsp;&nbsp; TCS ▲ +0.8% &nbsp;&nbsp; INFY ▲ +1.5% &nbsp;&nbsp; HDFCBANK ▲ +0.6% &nbsp;&nbsp; 
            RELIANCE ▲ +1.2% &nbsp;&nbsp; TCS ▲ +0.8% &nbsp;&nbsp; INFY ▲ +1.5% &nbsp;&nbsp; HDFCBANK ▲ +0.6%
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8 px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80 mb-2">
            Market Overview
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Investment Opportunities
          </h1>

          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Discover the best stocks and fixed deposits tailored for your investment goals
          </p>

          <div className="flex flex-col items-center mt-4">
            <button
              onClick={fetchInstruments}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm shadow transition ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search stocks (e.g., RELIANCE, TCS, AAPL, GOOGL)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value || "");
                  searchStocks(e.target.value);
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              
              {/* Dropdown UI */}
              {suggestions.length > 0 && searchTerm && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((item) => (
                    <div
                      key={item.symbol}
                      className="flex justify-between items-center px-4 py-3 hover:bg-white/10 cursor-pointer transition"
                    >
                      <div>
                        <div className="text-blue-400 font-semibold">{item.symbol}</div>
                        <div className="text-sm text-slate-400">{item.name}</div>
                      </div>
                      
                      <button
                        onClick={() => addToWatchlist(item.symbol)}
                        className="text-xs bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchLoading && (
                <div className="mt-2 text-sm text-blue-400 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSearchTerm("");
                  fetchInstruments();
                }}
                className={`px-4 py-3 rounded-xl font-medium transition ${
                  selectedType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setSelectedType("stock");
                  setSearchTerm("");
                  fetchInstruments();
                }}
                className={`px-4 py-3 rounded-xl font-medium transition ${
                  selectedType === "stock"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                Stocks
              </button>
              <button
                onClick={() => {
                  setSelectedType("fd");
                  setSearchTerm("");
                  fetchInstruments();
                }}
                className={`px-4 py-3 rounded-xl font-medium transition ${
                  selectedType === "fd"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                FDs
              </button>
            </div>
          </div>
        </div>

        {/* Search Results - Show prominently when searching */}
        {searchTerm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔍</span> 
              Search Results for "{searchTerm}" ({marketData.length} found)
            </h2>
            
            {searchLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-blue-200/60 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400">Searching stocks...</p>
              </div>
            ) : marketData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No stocks found</h3>
                <p className="text-slate-400 mb-4">Try searching for popular stocks like AAPL, GOOGL, TCS, or RELIANCE</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    fetchInstruments();
                  }}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-slate-300">Symbol</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-300">Name</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-300">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-300">Change</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-300">Sector</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(marketData || []).map((instrument) => (
                      <tr key={instrument.symbol} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-lg text-blue-400">{instrument.symbol}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{instrument.name}</div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="font-medium text-lg">
                            {formatCurrency(instrument.currentPrice)}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className={`font-semibold text-lg ${getChangeColor(instrument.changePercent)}`}>
                            {formatChange(instrument.changePercent)}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="text-sm text-slate-400">
                            {instrument.sector || 'N/A'}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          {instrument.type === 'stock' ? (
                            <>
                              <button 
                                onClick={() => addToWatchlist(instrument.symbol)}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition mr-2"
                              >
                                Add to Watchlist
                              </button>
                              <button
                                onClick={() => setAlert(instrument.symbol)}
                                className="text-yellow-400 text-sm hover:text-yellow-300 font-medium transition"
                              >
                                Set Alert
                              </button>
                            </>
                          ) : null}
                          <button className="text-sm text-slate-400 hover:text-slate-300 font-medium transition">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Top Performers - Hide when searching */}
        {!searchTerm && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Stocks */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur transition-all duration-300 hover:scale-[1.01]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📈 Top Performing Stocks
            </h2>

            <div className="space-y-3">
              {(displayStocks || []).map((stock, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-white">{stock.name}</p>
                      <p className="text-xs text-slate-400">{stock.symbol}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                  </div>

                  <div className="text-right">
                    <div className="transition-all duration-500 ease-in-out">
                      <p
                        className={`font-semibold transition-all duration-300 ${
                          String(stock.change).includes("-")
                            ? "text-red-400 animate-pulse"
                            : "text-green-400 animate-pulse"
                        }`}
                      >
                        ₹{stock.price || stock.currentPrice || 0}
                      </p>
                    </div>
                    <p
                      className={`text-xs flex items-center gap-1 transition-all duration-300 ${
                        String(stock.change).includes("-")
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {String(stock.change).includes("-") ? "▼" : "▲"} {stock.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {(!topStocks || topStocks.length === 0) && (
              <p className="text-xs text-yellow-400 mt-3 text-center">
                Showing sample data (API unavailable)
              </p>
            )}
          </div>

          {/* Best FDs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur transition-all duration-300 hover:scale-[1.01]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🏦 Best Fixed Deposits
            </h2>

            <div className="space-y-3">
              {mockFDs.map((fd, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{fd.bank}</p>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Safe
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {fd.duration} • Min ₹{fd.minAmount}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      {fd.rate}%
                    </p>
                    <p className="text-xs text-slate-400">
                      Interest Rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* All Instruments - Hide when searching */}
        {!searchTerm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">All Investment Options</h2>
          
          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-blue-200/60 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400">Loading market data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Instrument</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-right py-3 px-4">Price/Rate</th>
                    <th className="text-right py-3 px-4">Change</th>
                    <th className="text-right py-3 px-4">Risk</th>
                    <th className="text-right py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(marketData || []).map((instrument) => (
                    <tr key={instrument.symbol} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold">{instrument.name}</div>
                          <div className="text-sm text-slate-400">{instrument.symbol}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          instrument.type === 'stock' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {instrument.type === 'stock' ? 'Stock' : 'FD'}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        {instrument.type === 'stock' 
                          ? formatCurrency(instrument.currentPrice)
                          : `${instrument.interestRate}%`
                        }
                      </td>
                      <td className="text-right py-4 px-4">
                        {instrument.type === 'stock' && (
                          <span className={`text-sm font-semibold ${instrument.changePercent?.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {formatChange(instrument.changePercent)}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          instrument.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-300' :
                          instrument.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {instrument.riskLevel}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        {instrument.type === 'stock' ? (
                          <button 
                            onClick={() => addToWatchlist(instrument.symbol)}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition mr-2"
                          >
                            Add to Watchlist
                          </button>
                        ) : null}
                        <button className="text-sm text-slate-400 hover:text-slate-300 font-medium transition">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
