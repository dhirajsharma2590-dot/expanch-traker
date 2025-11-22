import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CategoryType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ReportsProps {
  transactions: Transaction[];
  currency: string;
}

const Reports: React.FC<ReportsProps> = ({ transactions, currency }) => {
  // Initialize date to the latest transaction date or today
  const [currentDate, setCurrentDate] = useState(() => {
    if (transactions.length > 0) {
      return new Date(transactions[0].date);
    }
    return new Date();
  });

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  // Process data for Pie Chart based on filtered transactions
  const expenseTransactions = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryData = Object.values(CategoryType).map(cat => {
    const amount = expenseTransactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: amount };
  }).filter(d => d.value > 0);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg border-none">
          <p className="label">{`${payload[0].name} : ${formatCurrency(payload[0].value, currency)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
       {/* Date Header */}
       <div className="flex justify-between items-center">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
          <div className="text-center">
            <h2 className="text-md font-bold text-gray-800 dark:text-white transition-colors">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-[10px] text-gray-400">
              You have spent <span className="text-orange-500 font-bold">{formatCurrency(totalExpense, currency)}</span> this month
            </p>
          </div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronRight size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
        </div>

        {/* Primary Metric */}
        <div className="bg-violet-600 text-white p-1 rounded-2xl inline-block w-full text-center shadow-lg shadow-violet-200 dark:shadow-none">
            <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-medium text-violet-200">Monthly Budget Status</span>
                {/* Mock budget total for visual consistency, can be made dynamic later */}
                <span className="text-xs font-bold">{totalExpense > 3000 ? 'Over Budget' : 'On Track'}</span>
            </div>
            <div className="bg-violet-800/50 h-2 w-full rounded-b-xl overflow-hidden">
                {/* Visual filler based on generic 3000 budget for report view */}
                <div className="bg-white h-full rounded-r-xl" style={{ width: `${Math.min((totalExpense / 3000) * 100, 100)}%` }}></div>
            </div>
        </div>

        {/* Pie Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Category Breakdown</h3>
           
           {categoryData.length === 0 ? (
             <div className="h-64 w-full flex items-center justify-center text-gray-400 text-sm">
               No expenses for this month.
             </div>
           ) : (
             <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as CategoryType]} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
               {/* Centered Text in Donut */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{formatCurrency(totalExpense, currency)}</p>
               </div>
             </div>
           )}

           {/* Custom Legend */}
           <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name as CategoryType] }}></div>
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{entry.name}</span>
                         <span className="text-[10px] text-gray-400">{Math.round((entry.value / totalExpense) * 100)}%</span>
                      </div>
                  </div>
              ))}
           </div>
        </div>
    </div>
  );
};

export default Reports;