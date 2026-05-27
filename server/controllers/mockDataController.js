// Mock data controller for testing without external APIs
class MockDataController {
  // Get mock stock data
  static getMockStocks() {
    return [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        type: 'stock',
        currentPrice: 2500 + Math.random() * 100,
        change: Math.random() * 50 - 25,
        changePercent: (Math.random() * 4 - 2).toFixed(2) + '%',
        sector: 'Energy',
        dividendYield: 1.2 + Math.random() * 0.5,
        marketCap: 'Large Cap',
        riskLevel: 'MEDIUM',
        expectedReturn: 12 + Math.random() * 3,
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        type: 'stock',
        currentPrice: 3400 + Math.random() * 200,
        change: Math.random() * 40 - 20,
        changePercent: (Math.random() * 3 - 1.5).toFixed(2) + '%',
        sector: 'Technology',
        dividendYield: 1.8 + Math.random() * 0.4,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 15 + Math.random() * 2,
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        type: 'stock',
        currentPrice: 1650 + Math.random() * 100,
        change: Math.random() * 30 - 15,
        changePercent: (Math.random() * 2 - 1).toFixed(2) + '%',
        sector: 'Banking',
        dividendYield: 1.5 + Math.random() * 0.3,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 14 + Math.random() * 2,
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        type: 'stock',
        currentPrice: 1450 + Math.random() * 100,
        change: Math.random() * 25 - 12,
        changePercent: (Math.random() * 3 - 1.5).toFixed(2) + '%',
        sector: 'Technology',
        dividendYield: 2.1 + Math.random() * 0.4,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 16 + Math.random() * 2,
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        type: 'stock',
        currentPrice: 625 + Math.random() * 50,
        change: Math.random() * 20 - 10,
        changePercent: (Math.random() * 3 - 1.5).toFixed(2) + '%',
        sector: 'Banking',
        dividendYield: 3.2 + Math.random() * 0.5,
        marketCap: 'Large Cap',
        riskLevel: 'MEDIUM',
        expectedReturn: 11 + Math.random() * 3,
        liquidity: 'HIGH',
        isActive: true,
        lastUpdated: new Date()
      }
    ];
  }

  // Get mock FD data
  static getMockFDs() {
    return [
      {
        symbol: 'SBI-FD-1YR',
        name: 'SBI Fixed Deposit 1 Year',
        type: 'fd',
        bankName: 'State Bank of India',
        interestRate: 6.8 + Math.random() * 0.2,
        tenure: 12,
        minAmount: 1000,
        maxAmount: 10000000,
        seniorCitizenRate: 7.3 + Math.random() * 0.2,
        riskLevel: 'LOW',
        expectedReturn: 6.8 + Math.random() * 0.2,
        liquidity: 'LOW',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'HDFC-FD-2YR',
        name: 'HDFC Fixed Deposit 2 Years',
        type: 'fd',
        bankName: 'HDFC Bank',
        interestRate: 7.2 + Math.random() * 0.2,
        tenure: 24,
        minAmount: 5000,
        maxAmount: 5000000,
        seniorCitizenRate: 7.7 + Math.random() * 0.2,
        riskLevel: 'LOW',
        expectedReturn: 7.2 + Math.random() * 0.2,
        liquidity: 'LOW',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'ICICI-FD-3YR',
        name: 'ICICI Fixed Deposit 3 Years',
        type: 'fd',
        bankName: 'ICICI Bank',
        interestRate: 7.5 + Math.random() * 0.2,
        tenure: 36,
        minAmount: 10000,
        maxAmount: 2000000,
        seniorCitizenRate: 8.0 + Math.random() * 0.2,
        riskLevel: 'LOW',
        expectedReturn: 7.5 + Math.random() * 0.2,
        liquidity: 'LOW',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'AXIS-FD-5YR',
        name: 'Axis Bank Fixed Deposit 5 Years',
        type: 'fd',
        bankName: 'Axis Bank',
        interestRate: 7.8 + Math.random() * 0.2,
        tenure: 60,
        minAmount: 10000,
        maxAmount: 10000000,
        seniorCitizenRate: 8.3 + Math.random() * 0.2,
        riskLevel: 'LOW',
        expectedReturn: 7.8 + Math.random() * 0.2,
        liquidity: 'LOW',
        isActive: true,
        lastUpdated: new Date()
      },
      {
        symbol: 'KOTAK-FD-1YR',
        name: 'Kotak Mahindra Fixed Deposit 1 Year',
        type: 'fd',
        bankName: 'Kotak Mahindra Bank',
        interestRate: 7.1 + Math.random() * 0.2,
        tenure: 12,
        minAmount: 5000,
        maxAmount: 5000000,
        seniorCitizenRate: 7.6 + Math.random() * 0.2,
        riskLevel: 'LOW',
        expectedReturn: 7.1 + Math.random() * 0.2,
        liquidity: 'LOW',
        isActive: true,
        lastUpdated: new Date()
      }
    ];
  }

  // Get all mock instruments
  static getAllMockInstruments() {
    return [...this.getMockStocks(), ...this.getMockFDs()];
  }
}

module.exports = MockDataController;
