import React, { useState, useRef } from 'react';
import { UserProfile, Transaction, Bill, NotificationPreferences } from '../types';
import { Camera, User, ChevronLeft, Save, Bell, Moon, Shield, Mail, Sun, Sparkles, Upload, X, Loader2, Download, Globe } from 'lucide-react';
import { generateAvatar } from '../services/geminiService';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  transactions: Transaction[];
  bills: Bill[];
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  user, 
  onUpdateUser, 
  onBack, 
  isDarkMode, 
  toggleDarkMode, 
  transactions, 
  bills 
}) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [notifications, setNotifications] = useState<NotificationPreferences>(user.notificationPreferences || {
    billReminders: true,
    budgetAlerts: true,
    weeklyReports: false
  });
  const [currency, setCurrency] = useState(user.currency || 'USD');
  const [isNotifExpanded, setIsNotifExpanded] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Avatar Modal States
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      avatarUrl,
      notificationPreferences: notifications,
      currency
    });
    setSuccessMessage("Profile Updated Successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setIsAvatarMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Add some context to the prompt to ensure it's suitable for an avatar
    const enhancedPrompt = `A cool, high-quality profile picture avatar of ${aiPrompt}, digital art style, centered, 1:1 aspect ratio`;
    
    const generatedImage = await generateAvatar(enhancedPrompt);
    
    setIsGenerating(false);
    if (generatedImage) {
      setAvatarUrl(generatedImage);
      setIsAvatarMenuOpen(false);
      setShowAiGenerator(false);
      setAiPrompt('');
    }
  };

  const handleExport = () => {
    const convertToCSV = (data: any[]) => {
      if (!data || data.length === 0) return '';
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => 
        Object.values(obj).map(val => {
            const str = String(val);
            // Escape quotes and wrap in quotes if contains comma or quote
            if (str.includes(',') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',')
      ).join('\n');
      return `${headers}\n${rows}`;
    };

    const downloadCSV = (content: string, fileName: string) => {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    let exported = false;

    if (transactions.length > 0) {
        const simpleTx = transactions.map(t => ({
            ID: t.id,
            Date: t.date,
            Title: t.title,
            Amount: t.amount,
            Type: t.type,
            Category: t.category
        }));
        downloadCSV(convertToCSV(simpleTx), `spendwise_transactions_${new Date().toISOString().slice(0,10)}.csv`);
        exported = true;
    }

    if (bills.length > 0) {
        const simpleBills = bills.map(b => ({
            ID: b.id,
            Title: b.title,
            Amount: b.amount,
            DueDate: b.dueDate,
            IsPaid: b.isPaid
        }));
        // Delay to prevent browser blocking multiple downloads
        setTimeout(() => {
             downloadCSV(convertToCSV(simpleBills), `spendwise_bills_${new Date().toISOString().slice(0,10)}.csv`);
        }, 500);
        exported = true;
    }

    if (exported) {
        setSuccessMessage("Data Exported Successfully");
    } else {
        setSuccessMessage("No data to export");
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-full bg-white dark:bg-gray-800 transition-colors duration-200 relative">
      {/* Custom Header for Profile */}
      <div className="px-6 pt-2 pb-6 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Profile</h2>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full border-4 border-violet-50 dark:border-gray-700 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900">
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              type="button"
              onClick={() => setIsAvatarMenuOpen(true)}
              className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full shadow-md hover:bg-violet-700 transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 font-medium">Change Profile Picture</p>
        </div>
      </div>

      <div className="p-6 space-y-8 animate-slide-up">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 text-gray-800 font-medium focus:border-violet-500 dark:focus:border-violet-500 focus:ring-0 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Currency</label>
            <div className="relative">
              <Globe className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 text-gray-800 font-medium focus:border-violet-500 dark:focus:border-violet-500 focus:ring-0 outline-none transition-all appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="email" 
                value={name.toLowerCase().replace(' ', '.') + '@example.com'}
                disabled
                className="w-full bg-gray-100 dark:bg-gray-900 border-2 border-transparent rounded-xl py-3 pl-12 pr-4 text-gray-500 dark:text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

           {/* Settings Toggles */}
          <div className="pt-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
             <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Preferences</h3>
             
             {/* Notification Section */}
             <div className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden transition-colors">
                <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setIsNotifExpanded(!isNotifExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-violet-600 dark:text-violet-300 shadow-sm">
                            <Bell size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notification Preferences</span>
                    </div>
                    <ChevronLeft size={18} className={`text-gray-400 transition-transform duration-200 ${isNotifExpanded ? '-rotate-90' : 'rotate-180'}`}/>
                </div>
                
                {isNotifExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-4 animate-slide-down border-t border-gray-100 dark:border-gray-600/50 mt-1">
                        <div className="flex items-center justify-between pl-12 pr-1 pt-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Bill Reminders</span>
                            <button 
                                type="button"
                                onClick={() => toggleNotification('billReminders')}
                                className={`w-8 h-5 rounded-full relative transition-colors ${notifications.billReminders ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                            >
                                 <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.billReminders ? 'left-[18px]' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between pl-12 pr-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Budget Alerts</span>
                            <button 
                                type="button"
                                onClick={() => toggleNotification('budgetAlerts')}
                                className={`w-8 h-5 rounded-full relative transition-colors ${notifications.budgetAlerts ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                            >
                                 <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.budgetAlerts ? 'left-[18px]' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between pl-12 pr-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Weekly Reports</span>
                            <button 
                                type="button"
                                onClick={() => toggleNotification('weeklyReports')}
                                className={`w-8 h-5 rounded-full relative transition-colors ${notifications.weeklyReports ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                            >
                                 <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications.weeklyReports ? 'left-[18px]' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                )}
             </div>

             <div 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={toggleDarkMode}
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-200 shadow-sm transition-colors">
                      {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                   </div>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-violet-600' : 'bg-gray-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${isDarkMode ? 'left-[22px]' : 'left-1'}`}></div>
                </div>
             </div>

             {/* Data Management Section */}
             <div 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={handleExport}
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm transition-colors">
                      <Download size={18} />
                   </div>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Export Data</span>
                </div>
                <ChevronLeft size={18} className="rotate-180 text-gray-400"/>
             </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-green-600 dark:text-green-400 shadow-sm">
                      <Shield size={18} />
                   </div>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Security</span>
                </div>
                 <ChevronLeft size={18} className="rotate-180 text-gray-400"/>
             </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 dark:bg-violet-600 hover:bg-gray-800 dark:hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 dark:shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-8 active:scale-95"
          >
            <Save size={20} />
            Save Changes
          </button>
        </form>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-fade-in-up z-50">
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full"></div>
          {successMessage}
        </div>
      )}

      {/* Avatar Selection Modal */}
      {isAvatarMenuOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl animate-slide-up relative border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => {
                setIsAvatarMenuOpen(false);
                setShowAiGenerator(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              {showAiGenerator ? 'Generate Avatar' : 'Change Photo'}
            </h3>

            {!showAiGenerator ? (
              <div className="space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center gap-3 text-gray-800 dark:text-white font-bold transition-colors group"
                >
                  <div className="p-2 bg-white dark:bg-gray-600 rounded-full shadow-sm text-violet-500 group-hover:text-violet-600">
                    <Upload size={20} />
                  </div>
                  Upload from Device
                </button>
                <button 
                  onClick={() => setShowAiGenerator(true)}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl flex items-center justify-center gap-3 text-white font-bold transition-all shadow-lg shadow-violet-500/20"
                >
                   <div className="p-2 bg-white/20 rounded-full shadow-sm text-white">
                    <Sparkles size={20} />
                  </div>
                  Generate with AI
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="p-4 bg-violet-50 dark:bg-gray-700/50 rounded-xl border border-violet-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Describe your avatar</p>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. A futuristic cyberpunk cat with neon glasses..."
                      className="w-full bg-transparent border-none resize-none outline-none text-sm font-bold text-gray-800 dark:text-white placeholder-gray-300 h-20"
                    />
                 </div>
                 
                 <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg shadow-violet-500/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowAiGenerator(false)}
                  className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;