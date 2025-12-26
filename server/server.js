const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const stockRoutes = require("./routes/stockRoutes");


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form-urlencoded bodies

// Root route
app.get("/", (req, res) => {
  res.send("Stock Tracker Backend Running");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stocks", stockRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: {
      root: "GET /",
      register: "POST /api/auth/register",
      test: "GET /api/auth/test"
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/api/auth/test`);
  console.log(`  POST http://localhost:${PORT}/api/auth/register`);
});
