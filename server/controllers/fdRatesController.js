class FDRatesController {
  // In-memory cache for FD rates
  static fdCache = new Map();
  static lastFetchTime = new Map();
  static CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Get FD rates with caching
  static async getFDRates() {
    const cacheKey = 'all_fds';
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const freshData = await this.fetchFDRates();
    this.setCachedData(cacheKey, freshData);
    return freshData;
  }

  // Get cached data if valid
  static getCachedData(key) {
    const cached = this.fdCache.get(key);
    const lastFetch = this.lastFetchTime.get(key);
    
    if (cached && lastFetch && (Date.now() - lastFetch) < this.CACHE_DURATION) {
      return cached;
    }
    
    return null;
  }

  // Set cached data
  static setCachedData(key, data) {
    this.fdCache.set(key, data);
    this.lastFetchTime.set(key, Date.now());
  }

  // Fetch FD rates (mock data for now, can be replaced with real API)
  static async fetchFDRates() {
    try {
      // In a real implementation, this would call bank APIs or financial data APIs
      // For now, using realistic mock data that updates periodically
      
      const baseRates = {
        'SBI': { base: 6.8, seniorBonus: 0.5 },
        'HDFC': { base: 7.2, seniorBonus: 0.5 },
        'ICICI': { base: 7.5, seniorBonus: 0.5 },
        'AXIS': { base: 7.8, seniorBonus: 0.5 },
        'KOTAK': { base: 7.1, seniorBonus: 0.5 }
      };

      const fdProducts = [
        // SBI FDs
        {
          symbol: 'SBI-FD-1YR',
          name: 'SBI Fixed Deposit 1 Year',
          bankName: 'State Bank of India',
          interestRate: baseRates.SBI.base + (Math.random() - 0.5) * 0.2,
          tenure: 12,
          minAmount: 1000,
          maxAmount: 10000000,
          seniorCitizenRate: baseRates.SBI.base + baseRates.SBI.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.SBI.base,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },
        {
          symbol: 'SBI-FD-2YR',
          name: 'SBI Fixed Deposit 2 Years',
          bankName: 'State Bank of India',
          interestRate: baseRates.SBI.base + 0.3 + (Math.random() - 0.5) * 0.2,
          tenure: 24,
          minAmount: 1000,
          maxAmount: 10000000,
          seniorCitizenRate: baseRates.SBI.base + 0.3 + baseRates.SBI.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.SBI.base + 0.3,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },
        {
          symbol: 'SBI-FD-3YR',
          name: 'SBI Fixed Deposit 3 Years',
          bankName: 'State Bank of India',
          interestRate: baseRates.SBI.base + 0.5 + (Math.random() - 0.5) * 0.2,
          tenure: 36,
          minAmount: 1000,
          maxAmount: 10000000,
          seniorCitizenRate: baseRates.SBI.base + 0.5 + baseRates.SBI.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.SBI.base + 0.5,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },

        // HDFC FDs
        {
          symbol: 'HDFC-FD-1YR',
          name: 'HDFC Fixed Deposit 1 Year',
          bankName: 'HDFC Bank',
          interestRate: baseRates.HDFC.base + (Math.random() - 0.5) * 0.2,
          tenure: 12,
          minAmount: 5000,
          maxAmount: 5000000,
          seniorCitizenRate: baseRates.HDFC.base + baseRates.HDFC.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.HDFC.base,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },
        {
          symbol: 'HDFC-FD-2YR',
          name: 'HDFC Fixed Deposit 2 Years',
          bankName: 'HDFC Bank',
          interestRate: baseRates.HDFC.base + 0.2 + (Math.random() - 0.5) * 0.2,
          tenure: 24,
          minAmount: 5000,
          maxAmount: 5000000,
          seniorCitizenRate: baseRates.HDFC.base + 0.2 + baseRates.HDFC.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.HDFC.base + 0.2,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },

        // ICICI FDs
        {
          symbol: 'ICICI-FD-1YR',
          name: 'ICICI Fixed Deposit 1 Year',
          bankName: 'ICICI Bank',
          interestRate: baseRates.ICICI.base + (Math.random() - 0.5) * 0.2,
          tenure: 12,
          minAmount: 10000,
          maxAmount: 2000000,
          seniorCitizenRate: baseRates.ICICI.base + baseRates.ICICI.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.ICICI.base,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },
        {
          symbol: 'ICICI-FD-3YR',
          name: 'ICICI Fixed Deposit 3 Years',
          bankName: 'ICICI Bank',
          interestRate: baseRates.ICICI.base + 0.3 + (Math.random() - 0.5) * 0.2,
          tenure: 36,
          minAmount: 10000,
          maxAmount: 2000000,
          seniorCitizenRate: baseRates.ICICI.base + 0.3 + baseRates.ICICI.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.ICICI.base + 0.3,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },

        // AXIS FDs
        {
          symbol: 'AXIS-FD-1YR',
          name: 'Axis Bank Fixed Deposit 1 Year',
          bankName: 'Axis Bank',
          interestRate: baseRates.AXIS.base + (Math.random() - 0.5) * 0.2,
          tenure: 12,
          minAmount: 10000,
          maxAmount: 10000000,
          seniorCitizenRate: baseRates.AXIS.base + baseRates.AXIS.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.AXIS.base,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },
        {
          symbol: 'AXIS-FD-5YR',
          name: 'Axis Bank Fixed Deposit 5 Years',
          bankName: 'Axis Bank',
          interestRate: baseRates.AXIS.base + 0.5 + (Math.random() - 0.5) * 0.2,
          tenure: 60,
          minAmount: 10000,
          maxAmount: 10000000,
          seniorCitizenRate: baseRates.AXIS.base + 0.5 + baseRates.AXIS.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.AXIS.base + 0.5,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        },

        // KOTAK FDs
        {
          symbol: 'KOTAK-FD-1YR',
          name: 'Kotak Mahindra Fixed Deposit 1 Year',
          bankName: 'Kotak Mahindra Bank',
          interestRate: baseRates.KOTAK.base + (Math.random() - 0.5) * 0.2,
          tenure: 12,
          minAmount: 5000,
          maxAmount: 5000000,
          seniorCitizenRate: baseRates.KOTAK.base + baseRates.KOTAK.seniorBonus,
          riskLevel: 'LOW',
          expectedReturn: baseRates.KOTAK.base,
          liquidity: 'LOW',
          type: 'fd',
          isActive: true,
          lastUpdated: new Date()
        }
      ];

      return fdProducts;
    } catch (error) {
      console.error('Error fetching FD rates:', error.message);
      return [];
    }
  }

  // Initialize FD cache
  static async initializeCache() {
    console.log('Initializing FD cache...');
    await this.getFDRates();
    console.log('FD cache initialized');
  }

  // Get cache status
  static getCacheStatus() {
    const cacheKey = 'all_fds';
    const lastFetch = this.lastFetchTime.get(cacheKey);
    
    if (!lastFetch) {
      return { status: 'Not initialized' };
    }

    const age = Date.now() - lastFetch;
    const expiresIn = Math.max(0, this.CACHE_DURATION - age);

    return {
      lastFetch: new Date(lastFetch).toISOString(),
      age: Math.floor(age / 1000), // seconds
      expiresIn: Math.floor(expiresIn / 1000), // seconds
      isExpired: age > this.CACHE_DURATION,
      totalFDs: this.fdCache.get(cacheKey)?.length || 0
    };
  }

  // Force refresh cache
  static async refreshCache() {
    const cacheKey = 'all_fds';
    const freshData = await this.fetchFDRates();
    this.setCachedData(cacheKey, freshData);
    console.log('FD cache refreshed');
    return freshData;
  }
}

module.exports = FDRatesController;
