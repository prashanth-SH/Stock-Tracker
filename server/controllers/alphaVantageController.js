const axios = require("axios");

class AlphaVantageController {
  // In-memory cache for stock data
  static stockCache = new Map();
  static lastFetchTime = new Map();
  static CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Get stock data with caching
  static async getStockData(symbols) {
    const results = {};
    
    for (const symbol of symbols) {
      const cachedData = this.getCachedData(symbol);
      if (cachedData) {
        results[symbol] = cachedData;
      } else {
        const freshData = await this.fetchFromAlphaVantage(symbol);
        if (freshData) {
          this.setCachedData(symbol, freshData);
          results[symbol] = freshData;
        }
      }
    }
    
    return results;
  }

  // Get individual stock data with dynamic caching
  static async getIndividualStock(symbol) {
    // First check cache
    const cachedData = this.getCachedData(symbol);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from API
    try {
      console.log(`Fetching ${symbol} from API (not in cache)`);
      const freshData = await this.fetchFromAlphaVantage(symbol);
      if (freshData) {
        // Add to cache
        this.setCachedData(symbol, freshData);
        
        // Also update the all_stocks cache if it exists
        const allStocksCache = this.getCachedData('all_stocks');
        if (allStocksCache && Array.isArray(allStocksCache)) {
          const stockExists = allStocksCache.some(stock => stock.symbol === symbol);
          if (!stockExists) {
            allStocksCache.push(freshData);
            this.setCachedData('all_stocks', allStocksCache);
          }
        }
        
        return freshData;
      }
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }

    // Fallback to mock data
    const mockData = this.generateMockStockData(symbol);
    this.setCachedData(symbol, mockData);
    return mockData;
  }

  // Add new stock to the system
  static async addStockToCache(symbol) {
    try {
      const stockData = await this.getIndividualStock(symbol);
      return stockData;
    } catch (error) {
      console.error(`Failed to add ${symbol} to cache:`, error);
      return null;
    }
  }

  // Get all available stocks (expanded list)
  static async getAllStocks() {
    const cacheKey = 'all_stocks';
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    // Comprehensive list of popular stocks (Indian + International)
    const allSymbols = [
      // Indian Stocks
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN',
      'ICICIBANK', 'HINDUNILVR', 'KOTAKBANK', 'ITC', 'BHARTIARTL',
      'AXISBANK', 'L&T', 'MARUTI', 'M&M', 'TITAN',
      'SUNPHARMA', 'ULTRACEMCO', 'WIPRO', 'HCLTECH', 'TECHM',
      'DRREDDY', 'ASIANPAINT', 'NESTLEIND', 'HDFCLIFE', 'SBILIFE',
      'GRASIM', 'POWERGRID', 'NTPC', 'ONGC', 'COALINDIA',
      'BPCL', 'IOC', 'GAIL', 'HINDALCO', 'JSWSTEEL',
      
      // US Tech Giants
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA',
      
      // US Large Caps
      'BRK.B', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'DIS', 'HD',
      'PYPL', 'ADBE', 'CRM', 'NFLX', 'INTC', 'CSCO', 'PFE', 'KO', 'PEP', 'T',
      
      // Chinese Tech
      'BABA', 'JD', 'BIDU', 'NIO', 'PDD', 'TME', 'BILI',
      
      // European Stocks
      'ASML', 'SAP', 'NESN', 'ROG', 'TSLA', 'NOVOB',
      
      // Other International
      'TM', 'SONY', 'SAMSUNG', 'HMC', 'NSANY', 'RY', 'TD', 'BNS', 'SHOP'
    ];

    try {
      // Batch process to avoid API limits
      const batchSize = 5;
      const stockData = {};
      
      for (let i = 0; i < allSymbols.length; i += batchSize) {
        const batch = allSymbols.slice(i, i + batchSize);
        const batchData = await this.getStockData(batch);
        Object.assign(stockData, batchData);
        
        // Small delay between batches to respect API limits
        if (i + batchSize < allSymbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const stocksArray = Object.values(stockData);
      
      // Cache the full array
      this.setCachedData(cacheKey, stocksArray);
      
      console.log(`Fetched ${stocksArray.length} stocks from API/cache`);
      return stocksArray;
    } catch (error) {
      console.error('Error fetching all stocks:', error);
      console.log('Using mock data for all stocks');
      return this.generateAllMockStocks();
    }
  }

  // Get cached data if valid
  static getCachedData(symbol) {
    const cached = this.stockCache.get(symbol);
    const lastFetch = this.lastFetchTime.get(symbol);
    
    if (cached && lastFetch && (Date.now() - lastFetch) < this.CACHE_DURATION) {
      return cached;
    }
    
    return null;
  }

  // Set cached data
  static setCachedData(symbol, data) {
    this.stockCache.set(symbol, data);
    this.lastFetchTime.set(symbol, Date.now());
  }

  // Fetch from Alpha Vantage API
  static async fetchFromAlphaVantage(symbol) {
    try {
      const apiKey = process.env.STOCK_API_KEY;
      if (!apiKey) {
        console.warn('STOCK_API_KEY not found in .env, using mock data');
        return this.generateMockStockData(symbol);
      }

      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data["Global Quote"];

      if (!data || !data["05. price"]) {
        console.warn(`Invalid response for ${symbol}, using mock data`);
        return this.generateMockStockData(symbol);
      }

      return {
        symbol: data["01. symbol"],
        name: this.getStockName(symbol),
        type: 'stock',
        currentPrice: parseFloat(data["05. price"]),
        change: parseFloat(data["09. change"]),
        changePercent: data["10. change percent"],
        sector: this.getStockSector(symbol),
        dividendYield: this.getDividendYield(symbol),
        marketCap: this.getMarketCap(symbol),
        riskLevel: this.getRiskLevel(symbol),
        expectedReturn: this.getExpectedReturn(symbol),
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error(`Error fetching ${symbol} from Alpha Vantage:`, error.message);
      return this.generateMockStockData(symbol);
    }
  }

  // Generate mock data as fallback
  static generateMockStockData(symbol) {
    const mockPrices = {
      // Indian Stocks
      'RELIANCE': { base: 2500, sector: 'Energy', name: 'Reliance Industries Ltd' },
      'TCS': { base: 3400, sector: 'Technology', name: 'Tata Consultancy Services' },
      'HDFCBANK': { base: 1650, sector: 'Banking', name: 'HDFC Bank Ltd' },
      'INFY': { base: 1450, sector: 'Technology', name: 'Infosys Ltd' },
      'SBIN': { base: 625, sector: 'Banking', name: 'State Bank of India' },
      'ICICIBANK': { base: 950, sector: 'Banking', name: 'ICICI Bank Ltd' },
      'HINDUNILVR': { base: 2500, sector: 'FMCG', name: 'Hindustan Unilever Ltd' },
      'KOTAKBANK': { base: 1800, sector: 'Banking', name: 'Kotak Mahindra Bank Ltd' },
      'ITC': { base: 400, sector: 'FMCG', name: 'ITC Ltd' },
      'BHARTIARTL': { base: 900, sector: 'Telecom', name: 'Bharti Airtel Ltd' },
      'AXISBANK': { base: 1100, sector: 'Banking', name: 'Axis Bank Ltd' },
      'L&T': { base: 3500, sector: 'Engineering', name: 'Larsen & Toubro Ltd' },
      'MARUTI': { base: 10000, sector: 'Auto', name: 'Maruti Suzuki India Ltd' },
      'M&M': { base: 1400, sector: 'Auto', name: 'Mahindra & Mahindra Ltd' },
      'TITAN': { base: 3500, sector: 'Consumer Durables', name: 'Titan Company Ltd' },
      'SUNPHARMA': { base: 1500, sector: 'Pharma', name: 'Sun Pharmaceutical Industries Ltd' },
      'ULTRACEMCO': { base: 8500, sector: 'Cement', name: 'UltraTech Cement Ltd' },
      'WIPRO': { base: 700, sector: 'Technology', name: 'Wipro Ltd' },
      'HCLTECH': { base: 1400, sector: 'Technology', name: 'HCL Technologies Ltd' },
      'TECHM': { base: 1200, sector: 'Technology', name: 'Tech Mahindra Ltd' },
      'DRREDDY': { base: 5500, sector: 'Pharma', name: 'Dr. Reddy\'s Laboratories Ltd' },
      'ASIANPAINT': { base: 3200, sector: 'Paints', name: 'Asian Paints Ltd' },
      'NESTLEIND': { base: 24000, sector: 'FMCG', name: 'Nestle India Ltd' },
      'HDFCLIFE': { base: 600, sector: 'Insurance', name: 'HDFC Life Insurance Company Ltd' },
      'SBILIFE': { base: 700, sector: 'Insurance', name: 'SBI Life Insurance Company Ltd' },
      'GRASIM': { base: 2000, sector: 'Textiles', name: 'Grasim Industries Ltd' },
      'POWERGRID': { base: 250, sector: 'Power', name: 'Power Grid Corporation of India Ltd' },
      'NTPC': { base: 350, sector: 'Power', name: 'NTPC Ltd' },
      'ONGC': { base: 200, sector: 'Oil & Gas', name: 'Oil and Natural Gas Corporation Ltd' },
      'COALINDIA': { base: 400, sector: 'Mining', name: 'Coal India Ltd' },
      'BPCL': { base: 500, sector: 'Oil & Gas', name: 'Bharat Petroleum Corporation Ltd' },
      'IOC': { base: 150, sector: 'Oil & Gas', name: 'Indian Oil Corporation Ltd' },
      'GAIL': { base: 450, sector: 'Gas', name: 'GAIL (India) Ltd' },
      'HINDALCO': { base: 600, sector: 'Metals', name: 'Hindalco Industries Ltd' },
      'JSWSTEEL': { base: 800, sector: 'Steel', name: 'JSW Steel Ltd' },
      
      // International Stocks (USD prices)
      'AAPL': { base: 175, sector: 'Technology', name: 'Apple Inc.' },
      'GOOGL': { base: 140, sector: 'Technology', name: 'Alphabet Inc.' },
      'MSFT': { base: 380, sector: 'Technology', name: 'Microsoft Corporation' },
      'AMZN': { base: 145, sector: 'E-Commerce', name: 'Amazon.com Inc.' },
      'TSLA': { base: 250, sector: 'Automotive', name: 'Tesla Inc.' },
      'META': { base: 320, sector: 'Social Media', name: 'Meta Platforms Inc.' },
      'NVDA': { base: 450, sector: 'Technology', name: 'NVIDIA Corporation' },
      'NFLX': { base: 420, sector: 'Entertainment', name: 'Netflix Inc.' },
      'DIS': { base: 90, sector: 'Entertainment', name: 'The Walt Disney Company' },
      'BABA': { base: 85, sector: 'E-Commerce', name: 'Alibaba Group' },
      
      // US Large Caps
      'BRK.B': { base: 350, sector: 'Financial Services', name: 'Berkshire Hathaway' },
      'JPM': { base: 150, sector: 'Banking', name: 'JPMorgan Chase & Co.' },
      'V': { base: 250, sector: 'Financial Services', name: 'Visa Inc.' },
      'JNJ': { base: 160, sector: 'Healthcare', name: 'Johnson & Johnson' },
      'WMT': { base: 165, sector: 'Retail', name: 'Walmart Inc.' },
      'PG': { base: 155, sector: 'Consumer Goods', name: 'Procter & Gamble' },
      'MA': { base: 380, sector: 'Financial Services', name: 'Mastercard Inc.' },
      'UNH': { base: 480, sector: 'Healthcare', name: 'UnitedHealth Group' },
      'HD': { base: 320, sector: 'Retail', name: 'The Home Depot' },
      'PYPL': { base: 60, sector: 'Financial Services', name: 'PayPal Holdings' },
      'ADBE': { base: 500, sector: 'Software', name: 'Adobe Inc.' },
      'CRM': { base: 250, sector: 'Software', name: 'Salesforce Inc.' },
      'INTC': { base: 35, sector: 'Technology', name: 'Intel Corporation' },
      'CSCO': { base: 50, sector: 'Technology', name: 'Cisco Systems' },
      'PFE': { base: 30, sector: 'Healthcare', name: 'Pfizer Inc.' },
      'KO': { base: 60, sector: 'Beverages', name: 'Coca-Cola Company' },
      'PEP': { base: 170, sector: 'Beverages', name: 'PepsiCo Inc.' },
      'T': { base: 20, sector: 'Telecommunications', name: 'AT&T Inc.' },
      
      // Chinese Tech
      'JD': { base: 35, sector: 'E-Commerce', name: 'JD.com' },
      'BIDU': { base: 100, sector: 'Internet', name: 'Baidu Inc.' },
      'NIO': { base: 8, sector: 'Electric Vehicles', name: 'NIO Inc.' },
      'PDD': { base: 120, sector: 'E-Commerce', name: 'PDD Holdings' },
      'TME': { base: 12, sector: 'Music Streaming', name: 'Tencent Music Entertainment' },
      'BILI': { base: 15, sector: 'Entertainment', name: 'Bilibili Inc.' },
      
      // European Stocks
      'ASML': { base: 750, sector: 'Semiconductors', name: 'ASML Holding NV' },
      'SAP': { base: 150, sector: 'Software', name: 'SAP SE' },
      'NESN': { base: 105, sector: 'Food Products', name: 'Nestlé S.A.' },
      'ROG': { base: 300, sector: 'Pharmaceuticals', name: 'Roche Holding AG' },
      'NOVOB': { base: 45, sector: 'Healthcare', name: 'Novo Nordisk A/S' },
      
      // Other International
      'TM': { base: 180, sector: 'Automotive', name: 'Toyota Motor Corporation' },
      'SONY': { base: 100, sector: 'Electronics', name: 'Sony Corporation' },
      'HMC': { base: 30, sector: 'Automotive', name: 'Honda Motor Co.' },
      'NSANY': { base: 12, sector: 'Automotive', name: 'Nissan Motor Co.' },
      'RY': { base: 95, sector: 'Banking', name: 'Royal Bank of Canada' },
      'TD': { base: 65, sector: 'Banking', name: 'Toronto-Dominion Bank' },
      'BNS': { base: 55, sector: 'Banking', name: 'Bank of Nova Scotia' },
      'SHOP': { base: 70, sector: 'E-Commerce', name: 'Shopify Inc.' }
    };

    const mock = mockPrices[symbol] || { 
      base: symbol.length > 4 ? 150 : 1000, // International stocks ~$150, Indian stocks ~₹1000
      sector: 'Unknown', 
      name: `${symbol} Ltd` 
    };
    
    const change = (Math.random() - 0.5) * mock.base * 0.1; // 10% max change
    const changePercent = ((change / mock.base) * 100).toFixed(2);

    return {
      symbol,
      name: mock.name,
      type: 'stock',
      currentPrice: mock.base + change,
      change,
      changePercent: changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`,
      sector: mock.sector,
      dividendYield: 1 + Math.random() * 3,
      marketCap: 'Large Cap',
      riskLevel: mock.sector === 'Banking' || mock.sector === 'Technology' ? 'MEDIUM' : 'HIGH',
      expectedReturn: 10 + Math.random() * 8,
      liquidity: 'HIGH',
      isActive: true,
      lastUpdated: new Date()
    };
  }

  // Generate mock data for all stocks
  static generateAllMockStocks() {
    const allSymbols = [
      // Indian Stocks
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN',
      'ICICIBANK', 'HINDUNILVR', 'KOTAKBANK', 'ITC', 'BHARTIARTL',
      'AXISBANK', 'L&T', 'MARUTI', 'M&M', 'TITAN',
      'SUNPHARMA', 'ULTRACEMCO', 'WIPRO', 'HCLTECH', 'TECHM',
      'DRREDDY', 'ASIANPAINT', 'NESTLEIND', 'HDFCLIFE', 'SBILIFE',
      'GRASIM', 'POWERGRID', 'NTPC', 'ONGC', 'COALINDIA',
      'BPCL', 'IOC', 'GAIL', 'HINDALCO', 'JSWSTEEL',
      
      // US Tech Giants
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA',
      
      // US Large Caps
      'BRK.B', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'DIS', 'HD',
      'PYPL', 'ADBE', 'CRM', 'NFLX', 'INTC', 'CSCO', 'PFE', 'KO', 'PEP', 'T',
      
      // Chinese Tech
      'BABA', 'JD', 'BIDU', 'NIO', 'PDD', 'TME', 'BILI',
      
      // European Stocks
      'ASML', 'SAP', 'NESN', 'ROG', 'NOVOB',
      
      // Other International
      'TM', 'SONY', 'HMC', 'NSANY', 'RY', 'TD', 'BNS', 'SHOP'
    ];

    return allSymbols.map(symbol => this.generateMockStockData(symbol));
  }

  // Helper methods for stock metadata
  static getStockName(symbol) {
    const names = {
      'RELIANCE': 'Reliance Industries Ltd',
      'TCS': 'Tata Consultancy Services',
      'HDFCBANK': 'HDFC Bank Ltd',
      'INFY': 'Infosys Ltd',
      'SBIN': 'State Bank of India'
    };
    return names[symbol] || `${symbol} Ltd`;
  }

  static getStockSector(symbol) {
    const sectors = {
      'RELIANCE': 'Energy',
      'TCS': 'Technology',
      'HDFCBANK': 'Banking',
      'INFY': 'Technology',
      'SBIN': 'Banking'
    };
    return sectors[symbol] || 'Unknown';
  }

  static getDividendYield(symbol) {
    const yields = {
      'RELIANCE': 1.2,
      'TCS': 1.8,
      'HDFCBANK': 1.5,
      'INFY': 2.1,
      'SBIN': 3.2
    };
    return yields[symbol] || 1.5;
  }

  static getMarketCap(symbol) {
    return 'Large Cap'; // Most Indian stocks are large cap
  }

  static getRiskLevel(symbol) {
    const sectors = this.getStockSector(symbol);
    return sectors === 'Banking' ? 'LOW' : 'MEDIUM';
  }

  static getExpectedReturn(symbol) {
    const returns = {
      'RELIANCE': 12,
      'TCS': 15,
      'HDFCBANK': 14,
      'INFY': 16,
      'SBIN': 11
    };
    return returns[symbol] || 13;
  }

  // Initialize cache with popular stocks
  static async initializeCache() {
    const popularStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN'];
    console.log('Initializing stock cache...');
    await this.getStockData(popularStocks);
    console.log('Stock cache initialized');
  }

  // Get cache status
  static getCacheStatus() {
    const status = {};
    for (const [symbol, lastFetch] of this.lastFetchTime) {
      const age = Date.now() - lastFetch;
      const expiresIn = Math.max(0, this.CACHE_DURATION - age);
      status[symbol] = {
        lastFetch: new Date(lastFetch).toISOString(),
        age: Math.floor(age / 1000), // seconds
        expiresIn: Math.floor(expiresIn / 1000), // seconds
        isExpired: age > this.CACHE_DURATION
      };
    }
    return status;
  }
}

module.exports = AlphaVantageController;
