const express = require("express");
const protect = require("../middleware/authMiddleware");
const MarketController = require("../controllers/marketController");

const router = express.Router();

// Get all instruments with filtering and pagination (public endpoint for basic stock data)
router.get("/instruments", MarketController.getAllInstruments);

// Get market overview stats (protected)
router.get("/overview", protect, MarketController.getMarketOverview);

// Get specific instrument details
router.get("/instrument/:symbol", protect, MarketController.getInstrumentDetails);

// Add sample data (development only)
router.post("/sample-data", MarketController.addSampleData);

module.exports = router;
