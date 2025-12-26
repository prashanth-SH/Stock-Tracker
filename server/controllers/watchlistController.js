const User = require("../models/user");

/**
 * GET watchlist
 */
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("watchlist");
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADD stock to watchlist
 */
const addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }

    const user = await User.findById(req.user.id);

    if (user.watchlist.includes(symbol.toUpperCase())) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }

    user.watchlist.push(symbol.toUpperCase());
    await user.save();

    res.json({
      message: "Stock added to watchlist",
      watchlist: user.watchlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * REMOVE stock from watchlist
 */
const removeFromWatchlist = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const user = await User.findById(req.user.id);

    user.watchlist = user.watchlist.filter(
      stock => stock !== symbol
    );

    await user.save();

    res.json({
      message: "Stock removed from watchlist",
      watchlist: user.watchlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
