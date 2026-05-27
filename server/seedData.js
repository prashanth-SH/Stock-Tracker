const mongoose = require('mongoose');
const FinancialInstrument = require('./models/FinancialInstrument');

const seedData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/stock-tracker');
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await FinancialInstrument.deleteMany({});
    
    // Sample data
    const sampleData = [
      // Sample Stocks
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        type: 'stock',
        currentPrice: 2500,
        change: 25,
        changePercent: '+1.02%',
        sector: 'Energy',
        dividendYield: 1.2,
        marketCap: 'Large Cap',
        riskLevel: 'MEDIUM',
        expectedReturn: 12,
        liquidity: 'HIGH'
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        type: 'stock',
        currentPrice: 3400,
        change: -15,
        changePercent: '-0.44%',
        sector: 'Technology',
        dividendYield: 1.8,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 15,
        liquidity: 'HIGH'
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        type: 'stock',
        currentPrice: 1650,
        change: 8,
        changePercent: '+0.49%',
        sector: 'Banking',
        dividendYield: 1.5,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 14,
        liquidity: 'HIGH'
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        type: 'stock',
        currentPrice: 1450,
        change: 12,
        changePercent: '+0.83%',
        sector: 'Technology',
        dividendYield: 2.1,
        marketCap: 'Large Cap',
        riskLevel: 'LOW',
        expectedReturn: 16,
        liquidity: 'HIGH'
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        type: 'stock',
        currentPrice: 625,
        change: -8,
        changePercent: '-1.26%',
        sector: 'Banking',
        dividendYield: 3.2,
        marketCap: 'Large Cap',
        riskLevel: 'MEDIUM',
        expectedReturn: 11,
        liquidity: 'HIGH'
      },
      
      // Sample FDs
      {
        symbol: 'SBI-FD-1YR',
        name: 'SBI Fixed Deposit 1 Year',
        type: 'fd',
        bankName: 'State Bank of India',
        interestRate: 6.8,
        tenure: 12,
        minAmount: 1000,
        maxAmount: 10000000,
        seniorCitizenRate: 7.3,
        riskLevel: 'LOW',
        expectedReturn: 6.8,
        liquidity: 'LOW'
      },
      {
        symbol: 'HDFC-FD-2YR',
        name: 'HDFC Fixed Deposit 2 Years',
        type: 'fd',
        bankName: 'HDFC Bank',
        interestRate: 7.2,
        tenure: 24,
        minAmount: 5000,
        maxAmount: 5000000,
        seniorCitizenRate: 7.7,
        riskLevel: 'LOW',
        expectedReturn: 7.2,
        liquidity: 'LOW'
      },
      {
        symbol: 'ICICI-FD-3YR',
        name: 'ICICI Fixed Deposit 3 Years',
        type: 'fd',
        bankName: 'ICICI Bank',
        interestRate: 7.5,
        tenure: 36,
        minAmount: 10000,
        maxAmount: 2000000,
        seniorCitizenRate: 8.0,
        riskLevel: 'LOW',
        expectedReturn: 7.5,
        liquidity: 'LOW'
      },
      {
        symbol: 'AXIS-FD-5YR',
        name: 'Axis Bank Fixed Deposit 5 Years',
        type: 'fd',
        bankName: 'Axis Bank',
        interestRate: 7.8,
        tenure: 60,
        minAmount: 10000,
        maxAmount: 10000000,
        seniorCitizenRate: 8.3,
        riskLevel: 'LOW',
        expectedReturn: 7.8,
        liquidity: 'LOW'
      },
      {
        symbol: 'KOTAK-FD-1YR',
        name: 'Kotak Mahindra Fixed Deposit 1 Year',
        type: 'fd',
        bankName: 'Kotak Mahindra Bank',
        interestRate: 7.1,
        tenure: 12,
        minAmount: 5000,
        maxAmount: 5000000,
        seniorCitizenRate: 7.6,
        riskLevel: 'LOW',
        expectedReturn: 7.1,
        liquidity: 'LOW'
      }
    ];
    
    await FinancialInstrument.insertMany(sampleData);
    console.log('Sample data inserted successfully');
    console.log(`Added ${sampleData.length} financial instruments`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
