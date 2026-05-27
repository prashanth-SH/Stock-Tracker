const mongoose = require('mongoose');
const FinancialInstrument = require('./models/FinancialInstrument');

async function debugMarket() {
  try {
    await mongoose.connect('mongodb://localhost:27017/stock-tracker');
    
    // Check all instruments
    const allInstruments = await FinancialInstrument.find({});
    console.log('Total instruments:', allInstruments.length);
    
    // Check active instruments
    const activeInstruments = await FinancialInstrument.find({ isActive: true });
    console.log('Active instruments:', activeInstruments.length);
    
    // Check stocks
    const stocks = await FinancialInstrument.find({ type: 'stock', isActive: true });
    console.log('Stocks:', stocks.length);
    
    // Check FDs
    const fds = await FinancialInstrument.find({ type: 'fd', isActive: true });
    console.log('FDs:', fds.length);
    
    // Try sorting by change
    const topStocks = await FinancialInstrument.find({ 
      type: 'stock', 
      isActive: true 
    })
      .sort({ change: -1 })
      .limit(5);
    
    console.log('Top stocks:', topStocks.map(s => ({ symbol: s.symbol, change: s.change })));
    
    // Try sorting by interestRate
    const topFDs = await FinancialInstrument.find({ 
      type: 'fd', 
      isActive: true 
    })
      .sort({ interestRate: -1 })
      .limit(5);
    
    console.log('Top FDs:', topFDs.map(f => ({ symbol: f.symbol, rate: f.interestRate })));
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugMarket();
