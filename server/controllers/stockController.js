const axios = require("axios");

// 🧠 In-memory cache
const priceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getStockPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const now = Date.now();

    // ✅ 1. Serve from cache if available & not expired
    if (
      priceCache[symbol] &&
      now - priceCache[symbol].timestamp < CACHE_TTL
    ) {
      return res.json(priceCache[symbol].data);
    }

    // ❌ Not cached or expired → call API
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.STOCK_API_KEY}`;

    const response = await axios.get(url);
    const data = response.data["Global Quote"];

    // ❌ Rate-limited or invalid response
    if (!data || !data["05. price"]) {
      return res.status(429).json({
        message: "Rate limited. Try again later.",
      });
    }

    const stockData = {
      symbol: data["01. symbol"],
      price: data["05. price"],
      change: data["09. change"],
      changePercent: data["10. change percent"],
      lastUpdated: data["07. latest trading day"],
    };

    // ✅ 2. Save to cache
    priceCache[symbol] = {
      data: stockData,
      timestamp: now,
    };

    res.json(stockData);
  } catch (error) {
    console.error("Stock API error:", error.message);
    res.status(500).json({ message: "Failed to fetch stock data" });
  }
};

module.exports = { getStockPrice };
