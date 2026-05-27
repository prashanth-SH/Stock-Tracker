const express = require("express");
const protect = require("../middleware/authMiddleware");
const AlphaVantageController = require("../controllers/alphaVantageController");
const FDRatesController = require("../controllers/fdRatesController");

const router = express.Router();

// Get cache status
router.get("/status", protect, (req, res) => {
  try {
    const stockCacheStatus = AlphaVantageController.getCacheStatus();
    const fdCacheStatus = FDRatesController.getCacheStatus();
    
    res.json({
      stockCache: stockCacheStatus,
      fdCache: fdCacheStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh stock cache
router.post("/refresh/stocks", protect, async (req, res) => {
  try {
    const stockSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN'];
    await AlphaVantageController.getStockData(stockSymbols);
    
    res.json({
      message: "Stock cache refreshed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh FD cache
router.post("/refresh/fds", protect, async (req, res) => {
  try {
    await FDRatesController.refreshCache();
    
    res.json({
      message: "FD cache refreshed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh all caches
router.post("/refresh/all", protect, async (req, res) => {
  try {
    const stockSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN'];
    
    await Promise.all([
      AlphaVantageController.getStockData(stockSymbols),
      FDRatesController.refreshCache()
    ]);
    
    res.json({
      message: "All caches refreshed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
