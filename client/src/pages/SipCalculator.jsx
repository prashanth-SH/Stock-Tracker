import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

function SipCalculator() {
  const navigate = useNavigate();
  
  // Form states
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(5);
  const [compounding, setCompounding] = useState('monthly');
  
  // Results
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [futureValue, setFutureValue] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);
  const [effectiveRate, setEffectiveRate] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    calculateSIP();
  }, [monthlyAmount, annualRate, years, compounding]);

  const calculateSIP = () => {
    const P = parseFloat(monthlyAmount) || 0;
    const r = parseFloat(annualRate) / 100 || 0;
    const n = parseInt(years) || 0;
    
    if (P <= 0 || n <= 0) {
      setTotalInvestment(0);
      setFutureValue(0);
      setTotalReturns(0);
      return;
    }

    let periodsPerYear, totalPeriods;
    
    switch (compounding) {
      case 'monthly':
        periodsPerYear = 12;
        totalPeriods = n * 12;
        break;
      case 'quarterly':
        periodsPerYear = 4;
        totalPeriods = n * 4;
        break;
      case 'yearly':
        periodsPerYear = 1;
        totalPeriods = n;
        break;
      default:
        periodsPerYear = 12;
        totalPeriods = n * 12;
    }

    // Calculate effective rate per period
    const effectiveRatePerPeriod = r / periodsPerYear;
    
    // Future Value calculation
    const fv = P * ((Math.pow(1 + effectiveRatePerPeriod, totalPeriods) - 1) / effectiveRatePerPeriod);
    
    // Total investment
    const totalInv = P * totalPeriods;
    
    // Total returns
    const totalRet = fv - totalInv;
    
    setTotalInvestment(totalInv);
    setFutureValue(fv);
    setTotalReturns(totalRet);
    setEffectiveRate(effectiveRatePerPeriod * 100);
  };

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
    return value;
  };

  const formatPercent = (value) => {
    if (typeof value === "number") {
      return `${value.toFixed(2)}%`;
    }
    return value;
  };

  const getReturnColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const presetAmounts = [5000, 10000, 15000, 25000, 50000];
  const presetRates = [8, 10, 12, 15, 18];
  const presetYears = [3, 5, 7, 10, 15];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80 mb-2">
            Investment Planning
          </p>
          <h1 className="text-3xl font-semibold mb-2">SIP Calculator</h1>
          <p className="text-slate-400">
            Calculate your Systematic Investment Plan returns and plan your financial future
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Investment Details
              </h2>

              <div className="space-y-6">
                {/* Monthly Investment */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monthly Investment Amount (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter monthly amount"
                      min="500"
                      step="500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      ₹
                    </div>
                  </div>
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {presetAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setMonthlyAmount(amount)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          monthlyAmount === amount
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Expected Annual Return (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter expected return"
                      min="1"
                      max="30"
                      step="0.1"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      %
                    </div>
                  </div>
                  {/* Quick Rate Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {presetRates.map(rate => (
                      <button
                        key={rate}
                        onClick={() => setAnnualRate(rate)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          annualRate === rate
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Period */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Investment Period (Years)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter years"
                      min="1"
                      max="30"
                      step="1"
                    />
                  </div>
                  {/* Quick Year Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {presetYears.map(year => (
                      <button
                        key={year}
                        onClick={() => setYears(year)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          years === year
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {year} yrs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compounding Frequency */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Compounding Frequency
                  </label>
                  <select
                    value={compounding}
                    onChange={(e) => setCompounding(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Calculation Results
              </h2>

              <div className="space-y-4">
                {/* Total Investment */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Investment</div>
                  <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvestment)}</div>
                </div>

                {/* Future Value */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Future Value</div>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(futureValue)}</div>
                </div>

                {/* Total Returns */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Total Returns</div>
                  <div className={`text-2xl font-bold ${getReturnColor(totalReturns)}`}>
                    {formatCurrency(totalReturns)}
                  </div>
                </div>

                {/* Return Percentage */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Return on Investment</div>
                  <div className={`text-2xl font-bold ${getReturnColor(totalReturns)}`}>
                    {totalInvestment > 0 ? formatPercent((totalReturns / totalInvestment) * 100) : '0.00%'}
                  </div>
                </div>
              </div>

              {/* Investment Insights */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/40 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Investment Insights</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Your investment will grow by <span className="text-green-400 font-semibold">{formatPercent((totalReturns / totalInvestment) * 100)}</span> over {years} years</p>
                  <p>• Effective rate per {compounding} period: <span className="text-blue-400 font-semibold">{formatPercent(effectiveRate)}</span></p>
                  <p>• Total periods: <span className="text-blue-400 font-semibold">{years * (compounding === 'monthly' ? 12 : compounding === 'quarterly' ? 4 : 1)}</span></p>
                  {totalReturns > totalInvestment * 0.5 && (
                    <p className="text-green-400">• Excellent returns! Consider diversifying to manage risk</p>
                  )}
                  {totalReturns < totalInvestment * 0.1 && (
                    <p className="text-yellow-400">• Conservative returns. Consider higher growth instruments</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📚</span>
              About SIP
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>• <strong>Systematic Investment Plan</strong> - Invest fixed amount regularly</p>
              <p>• <strong>Power of Compounding</strong> - Returns compound over time</p>
              <p>• <strong>Rupee Cost Averaging</strong> - Reduce market timing risk</p>
              <p>• <strong>Disciplined Investing</strong> - Build wealth systematically</p>
              <p>• <strong>Flexible Amounts</strong> - Start with as low as ₹500/month</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Smart Tips
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>• Start early to maximize compounding benefits</p>
              <p>• Increase SIP amount annually for better returns</p>
              <p>• Consider diversified mutual funds for lower risk</p>
              <p>• Review and rebalance portfolio yearly</p>
              <p>• Maintain emergency fund separate from SIP</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <span>📈</span>
            Browse Investment Options
          </button>
          <button
            onClick={() => navigate("/portfolio")}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
          >
            <span>📊</span>
            View My Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

export default SipCalculator;
