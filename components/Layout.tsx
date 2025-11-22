import React from 'react';
import { Home, CreditCard, PieChart, FileText, Plus, Bell, LogOut } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  onAddClick: () => void;
  user: UserProfile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, onAddClick, user, onLogout }) => {
  const navItems: { id: ViewState; icon: React.ReactNode; label: string }[] = [
    { id: 'HOME', icon: <Home size={24} />, label: 'Home' },
    { id: 'EXPENSES', icon: <CreditCard size={24} />, label: 'Expenses' },
    { id: 'BILLS', icon: <FileText size={24} />, label: 'Bills' },
    { id: 'REPORTS', icon: <PieChart size={24} />, label: 'Reports' },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-hidden relative flex flex-col h-screen transition-colors duration-200">
        {/* Header */}
        <header className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800 flex justify-between items-center z-10 transition-colors duration-200">
          <div 
            className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setCurrentView('PROFILE')}
          >
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm relative group transition-all">
               <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Welcome back,</p>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-none">{user.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 relative transition-colors">
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-700"></span>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {children}
        </main>

        {/* Floating Action Button - Centered Absolute */}
        {currentView !== 'PROFILE' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <button 
              onClick={onAddClick}
              className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center text-white transition-transform active:scale-95"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        {currentView !== 'PROFILE' && (
          <nav className="absolute bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 pb-6 pt-3 flex justify-between items-center z-20 rounded-t-3xl transition-colors duration-200">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  // Add margin to the middle two items to make space for FAB
                  index === 1 ? 'mr-8' : index === 2 ? 'ml-8' : ''
                } ${
                  currentView === item.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;