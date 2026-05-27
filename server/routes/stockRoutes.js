const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getStockPrice } = require("../controllers/stockController");
const AlphaVantageController = require("../controllers/alphaVantageController");

const router = express.Router();

router.get("/:symbol", protect, getStockPrice);

// New endpoint for dynamic stock fetching
router.post("/add", protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }

    const stockData = await AlphaVantageController.addStockToCache(symbol.toUpperCase());
    
    if (!stockData) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.json({
      message: "Stock added successfully",
      stock: stockData
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Failed to add stock" });
  }
});

module.exports = router;
