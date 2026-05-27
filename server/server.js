require("dotenv").config(); // ✅ MUST be at top

const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const stockRoutes = require("./routes/stockRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const marketRoutes = require("./routes/marketRoutes");
const cacheRoutes = require("./routes/cacheRoutes");

const AlphaVantageController = require("./controllers/alphaVantageController");
const FDRatesController = require("./controllers/fdRatesController");

// 🔥 Connect DB
connectDB();

// 🔍 Debug env (keep for now)
console.log('🔍 Environment Variables Check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'undefined');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
// app.get("/", (req, res) => {
//   res.send("Smart Investment Platform Backend Running");
// });
app.get("/", (req, res) => {
  console.log("🔥 ROOT HIT");
  res.send("NEW SERVER RUNNING");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/cache", cacheRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

// 🔥 Initialize cache
const initializeCache = async () => {
  try {
    console.log('Initializing caches...');
    await Promise.all([
      AlphaVantageController.initializeCache(),
      FDRatesController.initializeCache()
    ]);
    console.log('Caches initialized successfully');
  } catch (error) {
    console.error('Cache initialization failed:', error.message);
  }
};

// 🚀 Start server
app.listen(PORT, async () => {
  await initializeCache();

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 POST /api/chatbot/query`);
});