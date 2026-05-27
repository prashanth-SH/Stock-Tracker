const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    watchlist: {
      type: [String], // stock symbols like AAPL, MSFT
      default: []
    },
    // Financial Profile for AI Recommendations
    financialProfile: {
      monthlyIncome: {
        type: Number,
        default: 0
      },
      riskProfile: {
        type: String,
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
      },
      investmentGoals: [{
        type: String,
        enum: ['retirement', 'education', 'wealth_creation', 'emergency_fund', 'tax_saving']
      }],
      investmentHorizon: {
        type: Number, // years
        default: 5
      },
      existingInvestments: [{
        type: {
          type: String,
          enum: ['stock', 'fd', 'mutual_fund', 'bonds'],
          required: true
        },
        symbol: String,
        amount: Number,
        purchaseDate: Date,
        currentValue: Number
      }]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
