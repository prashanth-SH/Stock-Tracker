const express = require("express");
const protect = require("../middleware/authMiddleware");
const ChatbotController = require("../controllers/chatbotController");
const User = require("../models/User");

const router = express.Router();

// Process chatbot query (AI-powered)-"protected"need to add
router.post("/query", ChatbotController.processQuery);

// Analyze specific stock
router.post("/analyze-stock", protect, ChatbotController.analyzeStock);

// Portfolio optimization
router.post("/optimize-portfolio", protect, ChatbotController.optimizePortfolio);

// Get user financial profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("financialProfile");
    res.json(user.financialProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user financial profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.financialProfile = { ...user.financialProfile, ...req.body };
    await user.save();
    res.json({ message: "Profile updated successfully", profile: user.financialProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
