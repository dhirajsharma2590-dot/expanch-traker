import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Bills from './components/Bills';
import Reports from './components/Reports';
import Auth from './components/Auth';
import ProfileSettings from './components/ProfileSettings';
import { ViewState, Transaction, Bill, TransactionType, CategoryType, UserProfile } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_BILLS, MOCK_USER, INITIAL_BUDGETS } from './constants';
import { X, Calendar } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [budgets, setBudgets] = useState<Record<CategoryType, number>>(INITIAL_BUDGETS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Add Transaction/Bill State
  const [entryType, setEntryType] = useState<'EXPENSE' | 'INCOME' | 'BILL'>('EXPENSE');
  const [newAmount, setNewAmount] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<CategoryType>(CategoryType.FOOD);

  // Auth Handlers
  const handleLogin = (name: string, isNewUser: boolean) => {
    if (isNewUser) {
      // Reset for new user
      setUser({ 
        name: name, 
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`, 
        totalBalance: 0,
        notificationPreferences: {
          billReminders: true,
          budgetAlerts: true,
          weeklyReports: false
        },
        currency: 'USD'
      });
      setTransactions([]);
      setBills([]);
    } else {
      // Load Demo Data
      setUser({ ...MOCK_USER, name: name });
      setTransactions(INITIAL_TRANSACTIONS);
      setBills(INITIAL_BILLS);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('HOME');
    // Optional: Reset other states if needed
  };
  
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newTitle || !newDate) return;

    if (entryType === 'BILL') {
      // Add Bill
      const newBill: Bill = {
        id: Date.now().toString(),
        title: newTitle,
        amount: parseFloat(newAmount),
        dueDate: new Date(newDate).toISOString(),
        isPaid: false,
      };
      
      // Add to bills list
      setBills(prev => [...prev, newBill]);
      
      // Note: Adding a bill usually doesn't deduct balance until paid, so we don't update balance here.
      
    } else {
      // Add Transaction (Income/Expense)
      const type = entryType === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE;
      
      const newTx: Transaction = {
        id: Date.now().toString(),
        title: newTitle,
        amount: parseFloat(newAmount),
        date: new Date(newDate).toISOString(),
        category: newCategory,
        type: type,
      };

      // Add and sort by date descending (newest first)
      setTransactions(prev => {
        const updated = [newTx, ...prev];
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });

      // Update Balance based on transaction type
      const amount = parseFloat(newAmount);
      setUser(prev => ({
        ...prev,
        totalBalance: prev.totalBalance + (type === TransactionType.INCOME ? amount : -amount)
      }));
    }

    // Reset Form
    setNewAmount('');
    setNewTitle('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(false);
  };

  const handleMarkAsPaid = (id: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, isPaid: true } : bill
    ));
  };

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <Dashboard transactions={transactions} totalBalance={user.totalBalance} currency={user.currency} />;
      case 'EXPENSES':
        return (
          <Expenses 
            transactions={transactions} 
            budgets={budgets}
            onUpdateBudgets={setBudgets}
            currency={user.currency}
          />
        );
      case 'BILLS':
        return (
          <Bills 
            bills={bills} 
            currency={user.currency} 
            onMarkAsPaid={handleMarkAsPaid} 
          />
        );
      case 'REPORTS':
        return <Reports transactions={transactions} currency={user.currency} />;
      case 'PROFILE':
        return (
          <ProfileSettings 
            user={user} 
            onUpdateUser={handleUpdateUser} 
            onBack={() => setCurrentView('HOME')}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            transactions={transactions}
            bills={bills}
          />
        );
      default:
        return <Dashboard transactions={transactions} totalBalance={user.totalBalance} currency={user.currency} />;
    }
  };

  // If not authenticated, show Auth screen
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Main App
  return (
    <>
      <Layout 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onAddClick={() => {
          setEntryType('EXPENSE'); // Default to expense
          setIsAddModalOpen(true);
        }}
        user={user}
        onLogout={handleLogout}
      >
        {renderView()}
      </Layout>

      {/* Add Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Add New
            </h2>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEntryType('EXPENSE')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${entryType === 'EXPENSE' ? 'bg-white dark:bg-gray-600 shadow-sm text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('INCOME')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${entryType === 'INCOME' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('BILL')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${entryType === 'BILL' ? 'bg-white dark:bg-gray-600 shadow-sm text-violet-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Bill
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">{user.currency}</span>
                  <input 
                    type="number" 
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 dark:text-white border-none rounded-xl text-lg font-bold text-gray-800 focus:ring-2 focus:ring-violet-500 outline-none transition-colors"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {entryType === 'BILL' ? 'Bill Name' : 'Description'}
                </label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 dark:text-white border-none rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-500 outline-none transition-colors"
                  placeholder={entryType === 'BILL' ? "e.g. Internet Bill" : "e.g. Grocery Shopping"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  {entryType !== 'BILL' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                      <select 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 dark:text-white border-none rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-500 outline-none appearance-none transition-colors"
                      >
                        {Object.values(CategoryType).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className={entryType === 'BILL' ? "col-span-2" : ""}>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {entryType === 'BILL' ? 'Due Date' : 'Date'}
                    </label>
                    <div className="relative">
                        <input 
                          type="date" 
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 dark:text-white border-none rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-500 outline-none transition-colors appearance-none"
                        />
                        <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
              </div>

              <button 
                type="submit" 
                className={`w-full py-4 mt-4 text-white font-bold rounded-xl transition-all active:scale-95 ${
                  entryType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' :
                  entryType === 'BILL' ? 'bg-violet-600 hover:bg-violet-700' :
                  'bg-gray-900 dark:bg-orange-500 hover:bg-gray-800 dark:hover:bg-orange-600'
                }`}
              >
                {entryType === 'BILL' ? 'Add Bill' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default App;