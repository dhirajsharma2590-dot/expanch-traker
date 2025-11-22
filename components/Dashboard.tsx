import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CategoryType } from '../types';
import { CATEGORY_COLORS, MONTHS } from '../constants';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShoppingBag, Coffee, Zap, Car, HeartPulse, Briefcase, Music, CreditCard, MoreHorizontal, Sparkles } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import { formatCurrency } from '../utils';

interface DashboardProps {
  transactions: Transaction[];
  totalBalance: number;
  currency: string;
}

const CHART_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Sky Blue
  "#FFBE0B", // Yellow
  "#FB5607", // Orange
  "#8338EC", // Purple
  "#3A86FF", // Blue
  "#FF9F43", // Pastel Orange
  "#00D2D3", // Cyan
  "#5f27cd", // Deep Purple
  "#98BDFF", // Soft Blue
  "#10ac84"  // Green
];

const Dashboard: React.FC<DashboardProps> = ({ transactions, totalBalance, currency }) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Dynamic Date State
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const currentMonthIndex = new Date().getMonth(); // 0-11

  // Helper to map category to icon
  const getCategoryIcon = (cat: CategoryType) => {
    switch (cat) {
      case CategoryType.SHOPPING: return <ShoppingBag size={18} />;
      case CategoryType.FOOD: return <Coffee size={18} />;
      case CategoryType.TRANSPORT: return <Car size={18} />;
      case CategoryType.BILLS: return <Zap size={18} />;
      case CategoryType.HEALTH: return <HeartPulse size={18} />;
      case CategoryType.SALARY: return <Briefcase size={18} />;
      case CategoryType.ENTERTAINMENT: return <Music size={18} />;
      default: return <CreditCard size={18} />;
    }
  };

  const handleGetAdvice = async () => {
    setLoadingAi(true);
    const advice = await getFinancialAdvice(transactions, totalBalance);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  // Dynamically calculate chart data based on selectedYear
  const chartData = useMemo(() => {
    // Initialize 12 months
    const data = MONTHS.map(month => ({ name: month, income: 0, expense: 0 }));

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === selectedYear) {
        const monthIdx = tDate.getMonth();
        if (t.type === TransactionType.INCOME) {
          data[monthIdx].income += t.amount;
        } else {
          data[monthIdx].expense += t.amount;
        }
      }
    });

    return data;
  }, [transactions, selectedYear]);

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
      
      {/* Main Balance Card */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-xl shadow-violet-200 dark:shadow-none text-white transform transition-all hover:scale-[1.01]">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[#2D2F45] dark:bg-[#1e1e2d]">
           <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-violet-600/40 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-20%] w-64 h-64 bg-orange-500/30 rounded-full blur-3xl"></div>
           <svg className="absolute right-0 bottom-0 opacity-10" width="200" height="150" viewBox="0 0 200 150">
             <path d="M0,100 C50,50 150,150 200,50" fill="none" stroke="white" strokeWidth="2" />
             <path d="M0,120 C50,70 150,170 200,70" fill="none" stroke="white" strokeWidth="2" />
           </svg>
        </div>
        
        <div className="relative p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Balance</p>
              <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalBalance, currency)}</h2>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreHorizontal size={20} className="text-gray-300" />
            </button>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-400 font-mono tracking-wider">**** 7545</div>
            <div className="flex flex-col items-end">
              <div className="w-8 h-8 rounded-full bg-red-500/90 transform translate-x-3"></div>
              <div className="w-8 h-8 rounded-full bg-yellow-500/90 -mt-8"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Analytics</h3>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white dark:bg-gray-800 text-xs font-bold text-orange-500 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm outline-none transition-colors cursor-pointer"
          >
            <option value={currentYear}>Year - {currentYear}</option>
            <option value={currentYear - 1}>Year - {currentYear - 1}</option>
            <option value={currentYear - 2}>Year - {currentYear - 2}</option>
          </select>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={12}>
               <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 10}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-bg-opacity, 1)' }}
                wrapperClassName="dark:text-black"
                formatter={(value: number) => [formatCurrency(value, currency), '']}
              />
              <Bar dataKey="income" radius={[10, 10, 10, 10]}>
                {chartData.map((entry, index) => {
                  const isCurrentMonth = selectedYear === currentYear && index === currentMonthIndex;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      opacity={selectedYear === currentYear ? (isCurrentMonth ? 1 : 0.4) : 1}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini AI Insight */}
      <div className="bg-gradient-to-br from-violet-50 to-white dark:from-gray-800 dark:to-gray-900 border border-violet-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-violet-600 dark:text-violet-400" size={18} />
          <h3 className="font-bold text-violet-900 dark:text-violet-100 text-sm">SpendWise AI Insight</h3>
        </div>
        
        {!aiAdvice ? (
          <div className="flex flex-col items-start">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Get a quick analysis of your recent spending habits.</p>
            <button 
              onClick={handleGetAdvice} 
              disabled={loadingAi}
              className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-200 dark:shadow-none hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {loadingAi ? 'Thinking...' : 'Analyze Spending'}
            </button>
          </div>
        ) : (
           <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line animate-fade-in">
             {aiAdvice}
           </div>
        )}
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Transactions</h3>
          <button className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">View All</button>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
             <p className="text-center text-gray-400 text-sm py-4">No transactions yet.</p>
          ) : (
            transactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                    style={{ backgroundColor: `${CATEGORY_COLORS[transaction.category]}15` }} // 15 is hex opacity
                  >
                    <div style={{ color: CATEGORY_COLORS[transaction.category] }}>
                      {getCategoryIcon(transaction.category)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{transaction.title}</h4>
                    <p className="text-xs text-gray-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${transaction.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-400'}`}>
                    {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;