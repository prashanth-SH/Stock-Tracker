const { GoogleGenerativeAI } = require('@google/generative-ai');
const AlphaVantageController = require('../controllers/alphaVantageController');
const FDRatesController = require('../controllers/fdRatesController');

class GeminiService {
  constructor() {
    console.log('🔍 Checking Gemini API key...');
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not found');
      this.model = null;
    } else {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('✅ Gemini AI initialized');
      } catch (err) {
        console.error('❌ Gemini init failed:', err.message);
        this.model = null;
      }
    }
  }

  // 🔥 MAIN FUNCTION (FIXED)
  async generateInvestmentAdvice(userQuery, userProfile = {}) {
  try {
    if (!this.model) {
      throw new Error("Gemini not initialized");
    }

    // 🔥 Simple clean prompt (no heavy data)
    const prompt = `
You are a financial advisor.

User earns ₹${userProfile.income || 30000} per month.

Question:
${userQuery}

Give:
- Simple investment advice
- Suggested allocation
- Risk level
`;

    const result = await this.model.generateContent(prompt);

    const text = result.response.text();

    return {
      success: true,
      response: text,
      marketData: null
    };

  } catch (error) {
    console.error("❌ Gemini Error:", error.message);

    return {
      success: false,
      response: "AI is temporarily unavailable. Please try again.",
      marketData: null
    };
  }
}
  // 📊 MARKET CONTEXT
  prepareMarketContext(stocks, fds) {
    return {
      stocks: stocks.slice(0, 10),
      fixedDeposits: fds.slice(0, 5),
      marketTrend: this.analyzeMarketTrend(stocks)
    };
  }

  analyzeMarketTrend(stocks) {
    const positive = stocks.filter(s => s.changePercent?.includes('+')).length;
    const ratio = positive / stocks.length;

    if (ratio > 0.6) return 'Bullish';
    if (ratio < 0.4) return 'Bearish';
    return 'Neutral';
  }

  // 🧠 STRONG AI PROMPT
  createInvestmentPrompt(userQuery, marketContext, userProfile) {
    const {
      income,
      expenses,
      savings,
      riskTolerance,
      investmentGoal,
      experience,
      portfolio
    } = userProfile;

    return `
You are an expert financial advisor for Indian investors.

USER PROFILE:
- Income: ₹${income || 0}
- Expenses: ₹${expenses || 0}
- Savings: ₹${savings || 0}
- Risk: ${riskTolerance || 'Moderate'}
- Goal: ${investmentGoal || 'Wealth Growth'}
- Experience: ${experience || 'Beginner'}
- Portfolio: ${JSON.stringify(portfolio || [])}

MARKET DATA:
${JSON.stringify(marketContext, null, 2)}

QUESTION:
"${userQuery}"

INSTRUCTIONS:
- Give personalized advice
- Suggest Indian stocks
- Recommend allocation %
- Suggest safe options if low income
- Diversify (stocks + FD + SIP)
- Avoid unrealistic promises

FORMAT:
1. Recommendation
2. Reason
3. Allocation
4. Risk
5. Tip

End with disclaimer.
`;
  }

  // 📈 STOCK ANALYSIS (FIXED)
  async analyzeStock(symbol) {
    try {
      const stockData = await AlphaVantageController.getIndividualStock(symbol);

      const prompt = `
Analyze this stock:

${JSON.stringify(stockData, null, 2)}

Give:
1. Invest or not
2. Risk level
3. Short vs long term
4. Allocation %
5. Verdict
`;

      const result = await this.model.generateContent(prompt);

      return {
        success: true,
        analysis: result.response.text(),
        stockData
      };

    } catch (error) {
      return {
        success: false,
        analysis: 'Stock analysis failed',
        stockData: null
      };
    }
  }

  // 📊 PORTFOLIO OPTIMIZATION (FIXED)
  async optimizePortfolio(holdings = []) {
    try {
      const [stocks, fds] = await Promise.all([
        AlphaVantageController.getAllStocks(),
        FDRatesController.getFDRates()
      ]);

      const prompt = `
Optimize this portfolio:

${JSON.stringify(holdings)}

Suggest:
1. Better allocation %
2. Reduce risk
3. Add/remove assets
4. Diversification strategy
`;
      console.log("🔥 CALLING GEMINI...");

      const result = await this.model.generateContent(prompt);

      return {
        success: true,
        recommendations: result.response.text()
      };

    } catch (error) {
      return {
        success: false,
        recommendations: 'Portfolio optimization failed'
      };
    }
  }

  // 🛟 FALLBACK
  getFallbackResponse(query) {
    return "I'm here to help with investments! Ask me about stocks, FDs, or portfolio advice.";
  }
}

module.exports = new GeminiService();