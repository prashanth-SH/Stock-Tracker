const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  stockSymbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  stockName: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  buyPrice: {
    type: Number,
    required: true
  },

  investmentAmount: {
    type: Number
  },

  purchaseDate: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});


// 🔥 Auto calculate investment amount
portfolioSchema.pre("save", function (next) {
  this.investmentAmount = this.quantity * this.buyPrice;
  next();
});

module.exports = mongoose.model("Portfolio", portfolioSchema);