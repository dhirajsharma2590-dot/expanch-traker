import React, { useMemo } from 'react';
import { Bill } from '../types';
import { Zap, Wifi, Home, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';

interface BillsProps {
  bills: Bill[];
  currency: string;
  onMarkAsPaid: (id: string) => void;
}

const Bills: React.FC<BillsProps> = ({ bills, currency, onMarkAsPaid }) => {
  
  const getBillIcon = (title: string) => {
    if (title.toLowerCase().includes('electricity')) return <Zap size={20} />;
    if (title.toLowerCase().includes('internet')) return <Wifi size={20} />;
    if (title.toLowerCase().includes('rent')) return <Home size={20} />;
    return <AlertCircle size={20} />;
  };

  const nextBill = useMemo(() => {
    const unpaid = bills.filter(b => !b.isPaid);
    return unpaid.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  }, [bills]);

  const getDaysDue = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return 'Due today';
    return `Due in ${days} days`;
  };

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upcoming Bills</h2>
      </div>

      {/* Upcoming Highlight - Dynamic */}
      <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800 dark:border-gray-700 min-h-[160px] flex flex-col justify-center">
         <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-violet-600/30 rounded-full blur-3xl"></div>
         
         {nextBill ? (
           <>
             <h3 className="text-sm text-gray-400 font-medium mb-1">Next Due</h3>
             <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-bold">{nextBill.title}</h2>
                  <p className={`text-xs mt-1 ${getDaysDue(nextBill.dueDate).includes('Overdue') ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                    {getDaysDue(nextBill.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">{formatCurrency(nextBill.amount, currency)}</h2>
                  <button 
                    onClick={() => onMarkAsPaid(nextBill.id)}
                    className="mt-2 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
                  >
                    Pay Now
                  </button>
                </div>
             </div>
           </>
         ) : (
           <div className="flex flex-col items-center justify-center text-center relative z-10">
             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
               <Calendar size={24} className="text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-white">No Upcoming Bills</h3>
             <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
           </div>
         )}
      </div>

      {/* Bills List */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">All Bills</h3>
         
         {bills.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8 italic">No bills added yet.</p>
         )}

         {bills.map(bill => (
           <div key={bill.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
             <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bill.isPaid ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
                  {getBillIcon(bill.title)}
               </div>
               <div>
                 <h4 className={`font-bold text-sm ${bill.isPaid ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>{bill.title}</h4>
                 <p className="text-xs text-gray-400">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
               </div>
             </div>
             <div className="text-right">
               <p className="font-bold text-gray-800 dark:text-white">{formatCurrency(bill.amount, currency)}</p>
               {bill.isPaid ? (
                 <span className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold">
                   Paid <CheckCircle2 size={10} />
                 </span>
               ) : (
                 <button 
                   onClick={() => onMarkAsPaid(bill.id)}
                   className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors active:scale-95"
                 >
                   Mark Paid
                 </button>
               )}
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Bills;