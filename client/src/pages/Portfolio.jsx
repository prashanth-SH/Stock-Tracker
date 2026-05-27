import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiCards, setAiCards] = useState([]);
  const [aiAdvice, setAiAdvice] = useState([]);

  // Calculations moved outside function (using state values)
  const profit = totalValue - totalInvestment;

  const riskLevel =
    portfolio.length < 3 ? "High" :
    portfolio.length < 6 ? "Medium" :
    "Low";

  const trendData = (portfolio || []).map((item) => ({
    name: item.symbol,
    value: item.currentValue || 0,
  }));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchPortfolioData();

    const interval = setInterval(() => {
      fetchPortfolioData();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get user's watchlist
      const watchlist = JSON.parse(localStorage.getItem("userWatchlist") || "[]");
      
      if (watchlist.length === 0) {
        setPortfolio([]);
        setLoading(false);
        return;
      }

      // Get current stock prices
      const res = await api.get(`/market/instruments?type=stock&limit=100`);
      const instruments = res.data.instruments || [];
      
      // Create portfolio with mock investment data
      const portfolioData = watchlist.map(symbol => {
        const stock = instruments.find(s => s.symbol === symbol);
        if (!stock) return null;

        // Mock investment data (in real app, this would come from user's actual purchases)
        const investedAmount = Math.random() * 50000 + 10000; // Mock investment between 10k-60k
        const shares = Math.floor(investedAmount / stock.currentPrice);
        const currentValue = shares * stock.currentPrice;
        const returns = currentValue - investedAmount;
        const returnsPercent = ((returns / investedAmount) * 100).toFixed(2);

        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          investedAmount,
          shares,
          currentPrice: stock.currentPrice,
          currentValue,
          returns,
          returnsPercent,
          changePercent: stock.changePercent,
          riskLevel: stock.riskLevel || 'MEDIUM'
        };
      }).filter(Boolean);

      setPortfolio(portfolioData);

      // Calculate totals using portfolioData (not portfolio state)
      const totalValue = portfolioData.reduce(
        (sum, item) => sum + (item.currentValue || 0),
        0
      );

      const totalInvestment = portfolioData.reduce(
        (sum, item) => sum + (item.investedAmount || 0),
        0
      );

      const profit = totalValue - totalInvestment;

      setTotalInvestment(totalInvestment);
      setTotalValue(totalValue);
      setTotalReturns(profit);

    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      setError("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  // Chart data for portfolio allocation with safe fallbacks
  const chartData = (portfolio || []).map((item) => ({
    name: item.symbol || "Unknown",
    value: item.currentValue || 0,
  }));


  // AI Portfolio Analysis
  const analyzePortfolio = async () => {
    try {
      setLoadingAI(true);
      setAiCards([]);
      setAiAdvice([]);

      const res = await api.post("/chatbot/query", {
        message: `
        Analyze this portfolio and give:
        1. Buy suggestions
        2. Sell suggestions
        3. Risk level
        Portfolio: ${JSON.stringify(portfolio)}
        `
      });

      const text = res.data.text || "";
      
      // Split into points (basic logic)
      const points = text.split(".").filter((p) => p.trim() !== "");
      const lines = text.split("\n").filter(l => l.trim() !== "");

      setAiCards(points);
      setAiAdvice(lines);
    } catch (err) {
      setAiCards(["AI analysis failed"]);
      setAiAdvice(["AI analysis failed"]);
    } finally {
      setLoadingAI(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
    return value;
  };

  const formatPercent = (value) => {
    if (typeof value === "number") {
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    return value;
  };

  // Get tag style for AI recommendations
  const getTag = (text) => {
    if (text.toLowerCase().includes("buy"))
      return "bg-green-500/20 text-green-400";
    if (text.toLowerCase().includes("sell"))
      return "bg-red-500/20 text-red-400";
    return "bg-yellow-500/20 text-yellow-400";
  };

  const getReturnColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-200/60 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80 mb-2">
            Investment Tracking
          </p>
          <h1 className="text-3xl font-semibold mb-2">My Portfolio</h1>
          <p className="text-slate-400">
            Track your investments and monitor performance in real-time
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3">
            {error}
          </div>
        )}


        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-sm text-slate-400">Total Investment</div>
                <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvestment)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <div>
                <div className="text-sm text-slate-400">Current Value</div>
                <div className="text-2xl font-bold text-green-400">{formatCurrency(totalValue)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-sm text-slate-400">Total Returns</div>
                <div className={`text-2xl font-bold ${getReturnColor(totalReturns)}`}>
                  {formatCurrency(totalReturns)} ({formatPercent(totalInvestment > 0 ? (totalReturns/totalInvestment)*100 : 0)})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="mt-4">
          <span className="text-slate-400 text-sm">Risk Level: </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            riskLevel === "High"
              ? "bg-red-500/20 text-red-400"
              : riskLevel === "Medium"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-green-500/20 text-green-400"
          }`}>
            {riskLevel}
          </span>
        </div>

        {/* Portfolio Holdings */}
        {portfolio.length > 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Portfolio Holdings
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-slate-300">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-300">Sector</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Shares</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Avg Cost</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Current Price</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Market Value</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Returns</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-300">Return %</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-300">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((holding, index) => (
                    <tr key={holding.symbol} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-blue-400">{holding.symbol}</div>
                        <div className="text-sm text-slate-400">{holding.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-300">{holding.sector}</div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="font-medium">{holding.shares}</div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="font-medium">{formatCurrency(holding.investedAmount / holding.shares)}</div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="font-medium">{formatCurrency(holding.currentPrice)}</div>
                        <div className="text-xs text-slate-400">{holding.changePercent}</div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="font-semibold">{formatCurrency(holding.currentValue)}</div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className={`font-semibold ${getReturnColor(holding.returns)}`}>
                          {formatCurrency(holding.returns)}
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className={`font-semibold ${getReturnColor(parseFloat(holding.returnsPercent))}`}>
                          {formatPercent(parseFloat(holding.returnsPercent))}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRiskColor(holding.riskLevel)}`}>
                          {holding.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 backdrop-blur text-center">
            {loading && (
              <div className="text-center text-slate-400">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="animate-pulse text-slate-400">Loading portfolio data...</div>
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No Portfolio Data</h3>
            <p className="text-slate-400 mb-6">
              Start building your portfolio by adding stocks to your watchlist and tracking your investments.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              <span>📈</span>
              Browse Stocks
            </button>
          </div>
        )}

        {/* Safety Check */}
        {portfolio.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            No portfolio data available
          </div>
        )}

        {/* Portfolio Charts */}
        {portfolio.length > 0 && (
          <div className="bg-white/10 p-5 rounded-xl mt-6">
            <h3 className="mb-4 text-lg font-semibold">Portfolio Allocation</h3>

            <div className="relative">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={70}
                    paddingAngle={3}
                    isAnimationActive={true}
                    animationDuration={800}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={`hsl(${index * 60}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* CENTER VALUE */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-slate-400 text-sm font-medium">Total Portfolio Value</span>
                <span className="text-2xl font-bold text-white">
                  ₹{totalValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            {/* Portfolio Trend Line Chart */}
            <div className="bg-slate-800 p-5 rounded-xl mt-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Portfolio Trend
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Analysis Button */}
            <div className="mt-4 text-center">
              <button
                onClick={analyzePortfolio}
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-4 py-2 rounded mt-4 hover:scale-[1.02] hover:shadow-lg"
                disabled={loadingAI}
              >
                {loadingAI ? 'Analyzing...' : 'Analyze Portfolio (AI)'}
              </button>
            </div>

            {/* AI Results UI */}
            {loadingAI && (
              <div className="mt-4 text-blue-400 animate-pulse">
                Analyzing portfolio...
              </div>
            )}

            {aiCards.length > 0 && (
              <div className="mt-4 grid gap-3">
                {aiCards.map((point, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-800 border border-white/10 shadow hover:scale-[1.02] transition-all"
                  >
                    <h4 className="text-blue-400 font-semibold mb-1">
                      Insight {index + 1}
                    </h4>
                    <p className="text-slate-300 text-sm">{point.trim()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* AI Buy/Sell Recommendations */}
            {aiAdvice.length > 0 && (
              <div className="mt-6 grid gap-3">
                {aiAdvice.map((line, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800 rounded-xl border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-slate-300 text-sm flex-1">{line}</p>
                      <span className={`px-2 py-1 text-xs rounded ${getTag(line)}`}>
                        {line.includes("Buy") ? "BUY" :
                         line.includes("Sell") ? "SELL" : "HOLD"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Insights */}
        {portfolio.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Performance Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Best Performer</span>
                  <span className="font-semibold text-green-400">
                    {portfolio.reduce((best, holding) => 
                      parseFloat(holding.returnsPercent) > parseFloat(best.returnsPercent) ? holding : best
                    ).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Worst Performer</span>
                  <span className="font-semibold text-red-400">
                    {portfolio.reduce((worst, holding) => 
                      parseFloat(holding.returnsPercent) < parseFloat(worst.returnsPercent) ? holding : worst
                    ).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Winning Stocks</span>
                  <span className="font-semibold text-blue-400">
                    {portfolio.filter(h => parseFloat(h.returnsPercent) > 0).length} / {portfolio.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                Sector Allocation
              </h3>
              <div className="space-y-2">
                {Object.entries(
                  portfolio.reduce((sectors, holding) => {
                    sectors[holding.sector] = (sectors[holding.sector] || 0) + holding.currentValue;
                    return sectors;
                  }, {})
                ).map(([sector, value]) => (
                  <div key={sector} className="flex justify-between items-center">
                    <span className="text-slate-400">{sector}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${(value / totalValue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {((value / totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
