const FinancialInstrument = require("../models/FinancialInstrument");
const AlphaVantageController = require("./alphaVantageController");
const FDRatesController = require("./fdRatesController");

class MarketController {
  // Get all available financial instruments
  static async getAllInstruments(req, res) {
    try {
      const { type, search, sortBy = 'name', page = 1, limit = 20 } = req.query;
      
      // Get all cached data
      const [allStocks, fdData] = await Promise.all([
        AlphaVantageController.getAllStocks(),
        FDRatesController.getFDRates()
      ]);
      
      // Combine all instruments
      let instruments = allStocks.concat(fdData);
      
      // Filter by type
      if (type && type !== 'all') {
        instruments = instruments.filter(inst => inst.type === type);
      }
      
      // Search functionality
      if (search) {
        const searchLower = search.toLowerCase();
        instruments = instruments.filter(inst => 
          inst.name.toLowerCase().includes(searchLower) ||
          inst.symbol.toLowerCase().includes(searchLower) ||
          (inst.bankName && inst.bankName.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort
      instruments.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'change') return b.change - a.change;
        if (sortBy === 'interestRate') return b.interestRate - a.interestRate;
        if (sortBy === 'currentPrice') return b.currentPrice - a.currentPrice;
        if (sortBy === 'sector') return (a.sector || '').localeCompare(b.sector || '');
        return a.name.localeCompare(b.name);
      });
      
      // Pagination
      const skip = (page - 1) * limit;
      const paginatedInstruments = instruments.slice(skip, skip + parseInt(limit));
      
      res.json({
        instruments: paginatedInstruments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: instruments.length,
          pages: Math.ceil(instruments.length / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllInstruments:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get market overview stats
  static async getMarketOverview(req, res) {
    try {
      console.log('Getting market overview with expanded cached data...');
      
      // Get all cached data
      const [allStocks, fdData] = await Promise.all([
        AlphaVantageController.getAllStocks(),
        FDRatesController.getFDRates()
      ]);
      
      // Sort stocks by change
      const topStocks = allStocks.sort((a, b) => b.change - a.change).slice(0, 5);
      
      // Sort FDs by interest rate
      const topFDs = fdData.sort((a, b) => b.interestRate - a.interestRate).slice(0, 5);
      
      // Calculate stats
      const stats = [
        { 
          _id: 'stock', 
          count: allStocks.length, 
          avgReturn: allStocks.reduce((acc, s) => acc + (s.expectedReturn || 12), 0) / allStocks.length 
        },
        { 
          _id: 'fd', 
          count: fdData.length, 
          avgReturn: fdData.reduce((acc, f) => acc + (f.expectedReturn || 7), 0) / fdData.length 
        }
      ];
      
      console.log('Top stocks found:', topStocks.length);
      console.log('Total stocks available:', allStocks.length);
      console.log('Top FDs found:', topFDs.length);
      
      res.json({
        stats,
        topStocks,
        topFDs
      });
    } catch (error) {
      console.error('Error in getMarketOverview:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get instrument details
  static async getInstrumentDetails(req, res) {
    try {
      const { symbol } = req.params;
      const instrument = await FinancialInstrument.findOne({ 
        symbol: symbol.toUpperCase(), 
        isActive: true 
      });
      
      if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
      }
      
      res.json(instrument);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add sample data (for development)
  static async addSampleData(req, res) {
    try {
      const sampleData = [
        // Sample Stocks
        {
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd",
          type: "stock",
          currentPrice: 2500,
          change: 25,
          changePercent: "+1.02%",
          sector: "Energy",
          dividendYield: 1.2,
          marketCap: "Large Cap",
          riskLevel: "MEDIUM",
          expectedReturn: 12,
          liquidity: "HIGH"
        },
        {
          symbol: "TCS",
          name: "Tata Consultancy Services",
          type: "stock",
          currentPrice: 3400,
          change: -15,
          changePercent: "-0.44%",
          sector: "Technology",
          dividendYield: 1.8,
          marketCap: "Large Cap",
          riskLevel: "LOW",
          expectedReturn: 15,
          liquidity: "HIGH"
        },
        {
          symbol: "HDFCBANK",
          name: "HDFC Bank Ltd",
          type: "stock",
          currentPrice: 1650,
          change: 8,
          changePercent: "+0.49%",
          sector: "Banking",
          dividendYield: 1.5,
          marketCap: "Large Cap",
          riskLevel: "LOW",
          expectedReturn: 14,
          liquidity: "HIGH"
        },
        
        // Sample FDs
        {
          symbol: "SBI-FD-1YR",
          name: "SBI Fixed Deposit 1 Year",
          type: "fd",
          bankName: "State Bank of India",
          interestRate: 6.8,
          tenure: 12,
          minAmount: 1000,
          maxAmount: 10000000,
          seniorCitizenRate: 7.3,
          riskLevel: "LOW",
          expectedReturn: 6.8,
          liquidity: "LOW"
        },
        {
          symbol: "HDFC-FD-2YR",
          name: "HDFC Fixed Deposit 2 Years",
          type: "fd",
          bankName: "HDFC Bank",
          interestRate: 7.2,
          tenure: 24,
          minAmount: 5000,
          maxAmount: 5000000,
          seniorCitizenRate: 7.7,
          riskLevel: "LOW",
          expectedReturn: 7.2,
          liquidity: "LOW"
        },
        {
          symbol: "ICICI-FD-3YR",
          name: "ICICI Fixed Deposit 3 Years",
          type: "fd",
          bankName: "ICICI Bank",
          interestRate: 7.5,
          tenure: 36,
          minAmount: 10000,
          maxAmount: 2000000,
          seniorCitizenRate: 8.0,
          riskLevel: "LOW",
          expectedReturn: 7.5,
          liquidity: "LOW"
        }
      ];
      
      await FinancialInstrument.insertMany(sampleData);
      res.json({ message: "Sample data added successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MarketController;
