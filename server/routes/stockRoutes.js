const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getStockPrice } = require("../controllers/stockController");

const router = express.Router();

router.get("/:symbol", protect, getStockPrice);

module.exports = router;
