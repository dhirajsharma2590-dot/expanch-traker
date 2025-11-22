import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, TransactionType, CategoryType } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { ShoppingBag, Coffee, Zap, Car, HeartPulse, Briefcase, Music, ChevronLeft, ChevronRight, CreditCard, Smartphone, SlidersHorizontal, X, Save, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ExpensesProps {
  transactions: Transaction[];
  budgets: Record<CategoryType, number>;
  onUpdateBudgets: (budgets: Record<CategoryType, number>) => void;
  currency: string;
}

const Expenses: React.FC<ExpensesProps> = ({ transactions, budgets, onUpdateBudgets, currency }) => {
  // Initialize date to the latest transaction date or today
  const [currentDate, setCurrentDate] = useState(() => {
    if (transactions.length > 0) {
      return new Date(transactions[0].date);
    }
    return new Date();
  });

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<Record<CategoryType, number>>(budgets);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Navigation Handlers
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

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
  };

  // Filter transactions for the selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  // Generate All Days in the Month
  const daysInMonth = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // Scroll to selected date on mount or when month changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedDayIndex = currentDate.getDate() - 1;
      // Estimate width of a day item (approx 48px width + gap) or find element
      const dayElement = scrollContainerRef.current.children[selectedDayIndex] as HTMLElement;
      
      if (dayElement) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const scrollPos = dayElement.offsetLeft - (containerWidth / 2) + (dayElement.offsetWidth / 2);
        
        scrollContainerRef.current.scrollTo({
          left: scrollPos,
          behavior: 'smooth'
        });
      }
    }
  }, [currentDate.getMonth(), currentDate.getDate()]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

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

  // Calculate spending per category for the selected month
  const spendingByCategory = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  
  const expenseCategories = Object.values(CategoryType)
    .filter(cat => cat !== CategoryType.SALARY)
    .sort((a, b) => (spendingByCategory[b] || 0) - (spendingByCategory[a] || 0));

  const handleBudgetChange = (category: CategoryType, value: string) => {
    setEditingBudgets(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const saveBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudgets(editingBudgets);
    setIsBudgetModalOpen(false);
  };

  const openBudgetModal = () => {
    setEditingBudgets(budgets);
    setIsBudgetModalOpen(true);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
      
      {/* Calendar Strip */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
          <h2 className="text-md font-bold text-gray-800 dark:text-white transition-colors">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronRight size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-2 -mx-6 px-6 no-scrollbar snap-x cursor-grab active:cursor-grabbing"
        >
          {daysInMonth.map((day, idx) => {
            const isSelected = day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth();
            const isToday = new Date().toDateString() === day.toDateString();
            const dayName = day.toLocaleDateString('en-US', { weekday: 'narrow' });
            
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0 snap-center" 
                onClick={() => handleDayClick(day)}
              >
                <span className={`text-[10px] font-medium transition-colors ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}>
                  {dayName}
                </span>
                <div className={`w-10 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 -translate-y-1' 
                    : isToday
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-violet-600 rounded-3xl p-5 text-white shadow-lg shadow-violet-200 dark:shadow-none relative overflow-hidden">
           <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl transform translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start mb-6">
             <p className="text-violet-200 text-xs font-medium">Total Income</p>
             <button className="text-violet-200 hover:text-white"><MoreHorizontal size={20}/></button>
           </div>
           <h3 className="text-2xl font-bold mb-1">{formatCurrency(totalIncome, currency)}</h3>
           <div className="flex items-center gap-2 mt-4 opacity-80">
             <div className="p-1 bg-white/20 rounded">
               <CreditCard size={12} />
             </div>
             <span className="text-[10px] font-mono">**** 1985</span>
           </div>
        </div>

        {/* Expense Card */}
        <div className="bg-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-2xl transform -translate-x-6 translate-y-6"></div>
           <div className="flex justify-between items-start mb-6">
             <p className="text-orange-100 text-xs font-medium">Total Expense</p>
             <button className="text-orange-100 hover:text-white"><MoreHorizontal size={20}/></button>
           </div>
           <h3 className="text-2xl font-bold mb-1">{formatCurrency(totalExpense, currency)}</h3>
           <div className="flex items-center gap-2 mt-4 opacity-80">
             <div className="p-1 bg-white/20 rounded">
               <Smartphone size={12} />
             </div>
             <span className="text-[10px] font-mono">**** 1985</span>
           </div>
        </div>
      </div>

      {/* Budget & Spending Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Budget Tracking</h3>
            <button 
              onClick={openBudgetModal}
              className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors"
              title="Edit Budgets"
            >
              <SlidersHorizontal size={18} />
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors space-y-6">
             
             {filteredTransactions.length === 0 ? (
               <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                 No transactions found for this date.
               </div>
             ) : (
               expenseCategories.slice(0, 5).map(cat => {
                 const spent = spendingByCategory[cat] || 0;
                 const budget = budgets[cat] || 0;
                 const percentage = budget > 0 ? (spent / budget) * 100 : (spent > 0 ? 100 : 0);
                 const isOverBudget = spent > budget && budget > 0;
                 const barColor = isOverBudget 
                    ? 'bg-red-500' 
                    : percentage > 80 
                      ? 'bg-orange-500' 
                      : 'bg-violet-600';

                 if (spent === 0 && budget === 0) return null;

                 return (
                   <div key={cat} className="group">
                     <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center" style={{ color: CATEGORY_COLORS[cat as CategoryType] }}>
                          {getCategoryIcon(cat as CategoryType)}
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-baseline mb-1">
                           <h4 className="text-sm font-bold text-gray-800 dark:text-white">{cat}</h4>
                           <div className="text-right">
                              <span className={`text-xs font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{formatCurrency(spent, currency)}</span>
                              <span className="text-[10px] text-gray-400"> / {formatCurrency(budget, currency)}</span>
                           </div>
                         </div>
                         <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                           <div 
                              className={`h-2 rounded-full transition-all duration-500 ${barColor}`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })
             )}

             <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Transactions ({monthNames[currentDate.getMonth()]})</p>
                {filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).slice(0,3).map(t => (
                  <div key={t.id} className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors" style={{ color: CATEGORY_COLORS[t.category]}}>
                           {getCategoryIcon(t.category)}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.title}</span>
                     </div>
                     <span className="text-sm font-bold text-gray-800 dark:text-white">-{formatCurrency(t.amount, currency)}</span>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No recent activity.</p>
                )}
             </div>
        </div>
      </div>

      {/* Budget Edit Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Budget Settings</h2>
              <button 
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2">
              <form id="budget-form" onSubmit={saveBudgets} className="space-y-4 pb-4">
                {Object.values(CategoryType)
                  .filter(cat => cat !== CategoryType.SALARY)
                  .map(cat => (
                  <div key={cat} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-transparent focus-within:border-violet-200 dark:focus-within:border-gray-600 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm" style={{ color: CATEGORY_COLORS[cat] }}>
                      {getCategoryIcon(cat)}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{cat}</label>
                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{currency}</span>
                        <input 
                          type="number" 
                          value={editingBudgets[cat] || ''}
                          onChange={(e) => handleBudgetChange(cat, e.target.value)}
                          className="w-full bg-transparent border-none p-0 pl-8 text-gray-800 dark:text-white font-bold focus:ring-0 text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </form>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
              <button 
                form="budget-form"
                type="submit" 
                className="w-full py-4 bg-gray-900 dark:bg-violet-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-violet-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Budgets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;