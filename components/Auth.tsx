import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Wallet, Eye, EyeOff, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onLogin: (name: string, isNewUser: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- FORGOT PASSWORD LOGIC ---
    if (isForgotPassword) {
       if (!email || !/\S+@\S+\.\S+/.test(email)) {
         setError("Please enter a valid email address.");
         setIsLoading(false);
         return;
       }
       
       // In a real app, we would call an API here.
       // For now, we simulate a successful email send.
       setResetEmailSent(true);
       setIsLoading(false);
       return;
    }

    // --- AUTH LOGIC ---
    try {
      const storedUsers = localStorage.getItem('spendwise_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      if (!isLogin) {
        // --- SIGN UP LOGIC ---
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          setError("Account with this email already exists.");
          setIsLoading(false);
          return;
        }

        // Save new user
        const newUser = { 
          name: name || 'User', 
          email, 
          password 
        };
        users.push(newUser);
        localStorage.setItem('spendwise_users', JSON.stringify(users));
        
        // Log in as new user
        onLogin(newUser.name, true);
      } else {
        // --- LOG IN LOGIC ---
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          onLogin(user.name, false);
        } else {
          setError("Invalid email or password. Please sign up if you don't have an account.");
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError(null);
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6 font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up transition-colors duration-200">
        {/* Header / Logo Area */}
        <div className="bg-violet-600 p-8 text-center relative overflow-hidden">
           <div className="absolute top-[-50%] left-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-20%] w-48 h-48 bg-orange-500/20 rounded-full blur-3xl"></div>
           
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm text-white shadow-inner border border-white/10">
             <Wallet size={32} />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight">SpendWise</h1>
           <p className="text-violet-200 text-sm mt-2 font-medium">Master your money, master your life.</p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          
          {resetEmailSent ? (
            <div className="text-center py-4 animate-fade-in">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={32} />
               </div>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Check your mail</h2>
               <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                 We have sent password recovery instructions to <span className="font-bold text-gray-800 dark:text-white">{email}</span>.
               </p>
               <button 
                  onClick={handleBackToLogin}
                  className="w-full bg-gray-900 dark:bg-violet-600 hover:bg-gray-800 dark:hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
               >
                  Back to Sign In
               </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                  {isForgotPassword 
                    ? 'Reset Password' 
                    : (isLogin ? 'Welcome Back' : 'Create Account')
                  }
                </h2>
                {!isLogin && !isForgotPassword && <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">Free</span>}
              </div>

              {isForgotPassword && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4 leading-relaxed">
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && !isForgotPassword && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                      <input 
                        type="text" 
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 text-gray-800 dark:text-white font-medium focus:border-violet-500 dark:focus:border-violet-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 text-gray-800 dark:text-white font-medium focus:border-violet-500 dark:focus:border-violet-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Password</label>
                     <div className="relative group">
                       <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                       <input 
                         type={showPassword ? "text" : "password"} 
                         required={!isForgotPassword}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 pl-12 pr-12 text-gray-800 dark:text-white font-medium focus:border-violet-500 dark:focus:border-violet-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
                         placeholder="••••••••"
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                       >
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                       </button>
                     </div>
                     {isLogin && (
                       <div className="text-right mt-2">
                         <button 
                            type="button" 
                            onClick={() => {
                                setIsForgotPassword(true);
                                setError(null);
                            }}
                            className="text-xs font-bold text-violet-500 hover:text-violet-700 transition-colors"
                          >
                            Forgot Password?
                          </button>
                       </div>
                     )}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl animate-pulse border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 dark:bg-violet-600 hover:bg-gray-800 dark:hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 dark:shadow-violet-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {isForgotPassword 
                        ? 'Send Reset Link' 
                        : (isLogin ? 'Sign In' : 'Sign Up')
                      }
                      {!isForgotPassword && <ArrowRight size={20} />}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                {isForgotPassword ? (
                   <button 
                     onClick={handleBackToLogin}
                     className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                   >
                     <ChevronLeft size={16} /> Back to Login
                   </button>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {isLogin ? "Don't have an account?" : "Already have an account?"} 
                      <button 
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setName('');
                          setEmail('');
                          setPassword('');
                          setError(null);
                        }}
                        className="ml-2 font-bold text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 underline-offset-2 hover:underline transition-all"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
           animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
           from { opacity: 0; }
           to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Auth;