const mongoose = require("mongoose");

const financialInstrumentSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['stock', 'fd', 'mutual_fund', 'bond'],
    required: true
  },
  // For Stocks
  currentPrice: Number,
  change: Number,
  changePercent: String,
  sector: String,
  dividendYield: Number,
  marketCap: String,
  
  // For FDs
  bankName: String,
  interestRate: Number,
  tenure: Number, // in months
  minAmount: Number,
  maxAmount: Number,
  seniorCitizenRate: Number,
  
  // Common fields
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  expectedReturn: Number, // annual percentage
  liquidity: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for faster queries
financialInstrumentSchema.index({ type: 1, isActive: 1 });
financialInstrumentSchema.index({ symbol: 1 });

module.exports = mongoose.model("FinancialInstrument", financialInstrumentSchema);
