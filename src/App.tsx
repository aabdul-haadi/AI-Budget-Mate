import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './hooks/useAuth';
import { useBudgetData } from './hooks/useBudgetData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FooterNav } from './components/FooterNav';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BudgetPlanner } from './components/BudgetPlanner';
import { GoalTracker } from './components/GoalTracker';
import { ReportGenerator } from './components/ReportGenerator';
import { Settings } from './components/Settings';
import { AIAdvisor } from './components/AIAdvisor';
import { MonthlyComparison } from './components/MonthlyComparison';
import { CharityPage } from './components/CharityPage';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    transactions,
    budgets,
    goals,
    charityDonations,
    userProfile,
    settings,
    loading,
    setBudgets,
    setSettings,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addCharityDonation,
    updateUsername,
    updateCurrency,
    setTransactions,
    setGoals
  } = useBudgetData(user);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(settings.dark_mode ?? true);

  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignup = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleLogout = () => {
    signOut();
    setSidebarOpen(false);
  };

  // Show auth forms if user is not logged in
  if (!user) {
    if (authLoading) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
          <div className={`p-8 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Loading...
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (authMode === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode('signup')}
          darkMode={darkMode}
          loading={authLoading}
        />
      );
    } else {
      return (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode('login')}
          darkMode={darkMode}
          loading={authLoading}
        />
      );
    }
  }

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setSettings({ ...settings, darkMode: newDarkMode });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };
  const handleExportData = () => {
    const data = {
      transactions,
      budgets,
      goals,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.budgets) setBudgets(data.budgets);
    if (data.goals) setGoals(data.goals);
    if (data.settings) setSettings({ ...settings, ...data.settings });
  };

  const handleClearData = () => {
    setTransactions([]);
    setBudgets({});
    setGoals([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          transactions={transactions} 
          goals={goals} 
          charityDonations={charityDonations}
          darkMode={darkMode} 
          onTabChange={handleTabChange} 
        />;
      
      case 'add':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add Transaction
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Record your income and expenses
              </p>
            </div>
            
            <div className={`p-6 rounded-xl border shadow-lg ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <TransactionForm onAddTransaction={addTransaction} darkMode={darkMode} />
            </div>
            
            <div className={`p-6 rounded-xl border shadow-lg ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Transactions
              </h2>
              <TransactionList 
                transactions={transactions.slice(0, 10)} 
                onDeleteTransaction={deleteTransaction}
                darkMode={darkMode}
              />
            </div>
          </div>
        );
      
      case 'goals':
        return (
          <GoalTracker
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            darkMode={darkMode}
          />
        );
      
      case 'comparison':
        return <MonthlyComparison transactions={transactions} darkMode={darkMode} />;
      
      case 'advisor':
        return (
          <AIAdvisor
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            userProfile={userProfile}
            darkMode={darkMode}
          />
        );
      
      case 'charity':
        return (
          <CharityPage
            transactions={transactions}
            charityDonations={charityDonations}
            onAddDonation={addCharityDonation}
            darkMode={darkMode}
            onGoBack={() => setActiveTab('dashboard')}
          />
        );
      
      case 'reports':
        return <ReportGenerator transactions={transactions} darkMode={darkMode} />;
      
      case 'settings':
        return (
          <Settings
            settings={settings}
            userProfile={userProfile}
            onUpdateSettings={setSettings}
            onUpdateUsername={updateUsername}
            onUpdateCurrency={updateCurrency}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      
      default:
        return <Dashboard 
          transactions={transactions} 
          goals={goals} 
          charityDonations={charityDonations}
          darkMode={darkMode} 
        />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <Navbar 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode}
        user={user}
        onLogout={handleLogout}
        onTabChange={handleTabChange}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          darkMode={darkMode}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-6 lg:ml-72">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <FooterNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        darkMode={darkMode}
      />
      
      {/* Budget Planner Modal/Section - Only show on larger screens or as a separate tab */}
      {activeTab === 'budget' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4">
          <div className={`max-w-4xl mx-auto mt-8 rounded-lg ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          } max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <BudgetPlanner
                budgets={budgets}
                transactions={transactions}
                onUpdateBudgets={setBudgets}
                darkMode={darkMode}
              />
              <button
                onClick={() => handleTabChange('dashboard')}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {(loading || authLoading) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>Loading...</span>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
        className="mt-16"
      />
    </div>
  );
}

export default App;